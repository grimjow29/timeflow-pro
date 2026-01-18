import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { CreateTimeEntryInput, TimeEntry } from "@/lib/types";

/**
 * GET /api/time-entries
 * Liste les entrées de temps pour l'utilisateur connecté
 * Query params:
 * - week_start: date de début de semaine (YYYY-MM-DD)
 * - week_end: date de fin de semaine (YYYY-MM-DD)
 * - project_id: filtrer par projet (optionnel)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Récupérer les paramètres de query
    const searchParams = request.nextUrl.searchParams;
    const weekStart = searchParams.get("week_start");
    const weekEnd = searchParams.get("week_end");
    const projectId = searchParams.get("project_id");

    // Construire la requête
    let query = supabase
      .from("time_entries")
      .select(`
        *,
        project:projects(id, name, color)
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    // Filtrer par semaine si spécifié
    if (weekStart && weekEnd) {
      query = query.gte("date", weekStart).lte("date", weekEnd);
    }

    // Filtrer par projet si spécifié
    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur récupération time entries:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des entrées" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/time-entries
 * Crée une nouvelle entrée de temps
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parser le body
    const body: CreateTimeEntryInput = await request.json();

    // Validation des champs requis
    if (!body.project_id || !body.date || body.duration === undefined) {
      return NextResponse.json(
        { error: "Champs requis manquants: project_id, date, duration" },
        { status: 400 }
      );
    }

    // Valider la durée (positive et raisonnable)
    if (body.duration < 0 || body.duration > 1440) {
      return NextResponse.json(
        { error: "Durée invalide (doit être entre 0 et 1440 minutes)" },
        { status: 400 }
      );
    }

    // Créer l'entrée
    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: user.id,
        project_id: body.project_id,
        date: body.date,
        duration: body.duration,
        description: body.description || null,
        billable: body.billable ?? true,
      })
      .select(`
        *,
        project:projects(id, name, color)
      `)
      .single();

    if (error) {
      console.error("Erreur création time entry:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création de l'entrée" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
