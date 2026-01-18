import { getAuthUser, getSupabaseClient } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/approvals
 * Liste les timesheets en attente d'approbation
 * Pour les managers/validators: retourne les timesheets de leurs subordonnés
 * Pour les employés: retourne leurs propres timesheets
 * Query params:
 * - status: filtrer par statut (PENDING, APPROVED, REJECTED, DRAFT)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Vérifier l'authentification
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer le profil utilisateur pour connaître son rôle
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, group_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les paramètres de query
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status");

    // Construire la requête de base
    let query = supabase
      .from("timesheet_approvals")
      .select(`
        *,
        user:profiles!timesheet_approvals_user_id_fkey(id, name, email, avatar_url),
        validator:profiles!timesheet_approvals_validator_id_fkey(id, name, email),
        entries:time_entries(
          id,
          duration,
          date,
          project:projects(id, name, color)
        )
      `)
      .order("created_at", { ascending: false });

    // Appliquer le filtre de rôle
    if (profile.role === "ADMIN" || profile.role === "VALIDATOR") {
      // Admins et validateurs voient toutes les demandes (ou celles de leur groupe)
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      } else {
        // Par défaut, montrer les PENDING pour les validateurs
        query = query.eq("status", "PENDING");
      }
    } else if (profile.role === "MANAGER") {
      // Les managers voient les demandes de leur groupe
      if (profile.group_id) {
        // D'abord récupérer les membres du groupe
        const { data: groupMembers } = await supabase
          .from("profiles")
          .select("id")
          .eq("group_id", profile.group_id);

        const memberIds = groupMembers?.map((m) => m.id) || [];
        if (memberIds.length > 0) {
          query = query.in("user_id", memberIds);
        }
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      } else {
        query = query.eq("status", "PENDING");
      }
    } else {
      // Employés: leurs propres timesheets uniquement
      query = query.eq("user_id", user.id);
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur récupération approvals:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des approbations" },
        { status: 500 }
      );
    }

    // Transformer les données pour inclure le total des heures et breakdown
    const approvals = data?.map((approval) => {
      const entries = approval.entries || [];
      const totalMinutes = entries.reduce(
        (sum: number, e: { duration: number }) => sum + e.duration,
        0
      );

      // Calculer le breakdown par projet
      const projectMap = new Map<
        string,
        { project: string; color: string; minutes: number }
      >();
      entries.forEach(
        (entry: {
          duration: number;
          project?: { id: string; name: string; color: string };
        }) => {
          if (entry.project) {
            const existing = projectMap.get(entry.project.id);
            if (existing) {
              existing.minutes += entry.duration;
            } else {
              projectMap.set(entry.project.id, {
                project: entry.project.name,
                color: entry.project.color,
                minutes: entry.duration,
              });
            }
          }
        }
      );

      const breakdown = Array.from(projectMap.values()).map((p) => ({
        project: p.project,
        color: p.color,
        hours: `${Math.floor(p.minutes / 60)}h${
          p.minutes % 60 > 0 ? String(p.minutes % 60).padStart(2, "0") : ""
        }`,
      }));

      return {
        ...approval,
        totalHours: `${Math.floor(totalMinutes / 60)}:${String(
          totalMinutes % 60
        ).padStart(2, "0")}`,
        breakdown,
      };
    });

    return NextResponse.json({ data: approvals });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/approvals
 * Soumet un timesheet pour approbation
 * Body: { week_start: string, week_end: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Vérifier l'authentification
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Parser le body
    const body = await request.json();
    const { week_start, week_end } = body;

    if (!week_start || !week_end) {
      return NextResponse.json(
        { error: "Champs requis manquants: week_start, week_end" },
        { status: 400 }
      );
    }

    // Vérifier s'il existe déjà une approbation pour cette semaine
    const { data: existing } = await supabase
      .from("timesheet_approvals")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("week_start", week_start)
      .single();

    if (existing) {
      if (existing.status === "PENDING") {
        return NextResponse.json(
          { error: "Une demande d'approbation est déjà en cours pour cette semaine" },
          { status: 400 }
        );
      }
      if (existing.status === "APPROVED") {
        return NextResponse.json(
          { error: "Ce timesheet a déjà été approuvé" },
          { status: 400 }
        );
      }
    }

    // Récupérer les entrées de temps pour cette semaine
    const { data: entries, error: entriesError } = await supabase
      .from("time_entries")
      .select("id, duration")
      .eq("user_id", user.id)
      .gte("date", week_start)
      .lte("date", week_end);

    if (entriesError) {
      console.error("Erreur récupération entries:", entriesError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des entrées de temps" },
        { status: 500 }
      );
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "Aucune entrée de temps pour cette semaine" },
        { status: 400 }
      );
    }

    // Calculer le total des heures
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours = totalMinutes / 60;

    // Créer ou mettre à jour l'approbation
    let approvalData;

    if (existing && existing.status === "REJECTED") {
      // Resoumettre un timesheet rejeté
      const { data, error } = await supabase
        .from("timesheet_approvals")
        .update({
          status: "PENDING",
          total_hours: totalHours,
          submitted_at: new Date().toISOString(),
          reviewed_at: null,
          validator_id: null,
          comments: null,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      approvalData = data;
    } else {
      // Nouvelle soumission
      const { data, error } = await supabase
        .from("timesheet_approvals")
        .insert({
          user_id: user.id,
          week_start,
          week_end,
          total_hours: totalHours,
          status: "PENDING",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      approvalData = data;
    }

    // Lier les entrées de temps à ce timesheet
    const entryIds = entries.map((e) => e.id);
    await supabase
      .from("time_entries")
      .update({ timesheet_id: approvalData.id })
      .in("id", entryIds);

    return NextResponse.json({ data: approvalData }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
