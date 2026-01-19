export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/approvals/[id]
 * Récupère les détails d'un timesheet spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer le timesheet avec toutes les infos
    const { data, error } = await supabase
      .from("timesheet_approvals")
      .select(`
        *,
        user:profiles!timesheet_approvals_user_id_fkey(id, name, email, avatar_url),
        validator:profiles!timesheet_approvals_validator_id_fkey(id, name, email),
        entries:time_entries(
          id,
          duration,
          date,
          description,
          billable,
          project:projects(id, name, color)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erreur récupération approval:", error);
      return NextResponse.json(
        { error: "Timesheet non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions (utilisateur peut voir son propre timesheet, managers/admin peuvent tout voir)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, group_id")
      .eq("id", user.id)
      .single();

    const isOwner = data.user_id === user.id;
    const isAdmin = profile?.role === "ADMIN";
    const isValidator = profile?.role === "VALIDATOR";
    const isManager = profile?.role === "MANAGER";

    if (!isOwner && !isAdmin && !isValidator && !isManager) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Calculer les stats
    const entries = data.entries || [];
    const totalMinutes = entries.reduce(
      (sum: number, e: { duration: number }) => sum + e.duration,
      0
    );

    return NextResponse.json({
      data: {
        ...data,
        totalHours: `${Math.floor(totalMinutes / 60)}:${String(
          totalMinutes % 60
        ).padStart(2, "0")}`,
      },
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
