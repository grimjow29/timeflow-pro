import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/time-entries/[id]
 * Récupère une entrée de temps spécifique
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Récupérer l'entrée
    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        project:projects(id, name, color)
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Entrée non trouvée" },
          { status: 404 }
        );
      }
      console.error("Erreur récupération time entry:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération de l'entrée" },
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
 * PUT /api/time-entries/[id]
 * Met à jour une entrée de temps existante
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const body = await request.json();

    // Vérifier que l'entrée appartient à l'utilisateur
    const { data: existing, error: checkError } = await supabase
      .from("time_entries")
      .select("id, user_id, timesheet_id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé à modifier cette entrée" },
        { status: 403 }
      );
    }

    // Vérifier si l'entrée fait partie d'un timesheet soumis
    if (existing.timesheet_id) {
      // On pourrait vérifier le statut du timesheet ici
      // Pour l'instant on autorise la modification
    }

    // Valider la durée si présente
    if (body.duration !== undefined && (body.duration < 0 || body.duration > 1440)) {
      return NextResponse.json(
        { error: "Durée invalide (doit être entre 0 et 1440 minutes)" },
        { status: 400 }
      );
    }

    // Construire les champs à mettre à jour
    const updateData: Record<string, unknown> = {};
    if (body.project_id !== undefined) updateData.project_id = body.project_id;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.billable !== undefined) updateData.billable = body.billable;

    // Mettre à jour l'entrée
    const { data, error } = await supabase
      .from("time_entries")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`
        *,
        project:projects(id, name, color)
      `)
      .single();

    if (error) {
      console.error("Erreur mise à jour time entry:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de l'entrée" },
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
 * DELETE /api/time-entries/[id]
 * Supprime une entrée de temps
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Vérifier que l'entrée appartient à l'utilisateur
    const { data: existing, error: checkError } = await supabase
      .from("time_entries")
      .select("id, user_id, timesheet_id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer cette entrée" },
        { status: 403 }
      );
    }

    // Vérifier si l'entrée fait partie d'un timesheet soumis
    if (existing.timesheet_id) {
      return NextResponse.json(
        { error: "Impossible de supprimer une entrée liée à un timesheet soumis" },
        { status: 400 }
      );
    }

    // Supprimer l'entrée
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erreur suppression time entry:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression de l'entrée" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
