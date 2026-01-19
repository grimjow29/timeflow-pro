export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ProjectStatus } from "@/lib/types";

interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  parent_id?: string | null;
  billable?: boolean;
  hourly_rate?: number | null;
  budget?: number | null;
  status?: ProjectStatus;
}

/**
 * GET /api/projects/[id]
 * Récupère un projet spécifique avec ses sous-projets
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

    // Récupérer le projet
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erreur récupération project:", error);
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les sous-projets
    const { data: children } = await supabase
      .from("projects")
      .select("*")
      .eq("parent_id", id)
      .order("name", { ascending: true });

    return NextResponse.json({
      data: {
        ...project,
        children: children || [],
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

/**
 * PUT /api/projects/[id]
 * Modifie un projet existant
 */
export async function PUT(
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

    // Vérifier que le projet existe
    const { data: existingProject, error: findError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existingProject) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Parser le body
    const body: UpdateProjectInput = await request.json();

    // Validation du nom si fourni
    if (body.name !== undefined && body.name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du projet ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Valider le budget si fourni
    if (body.budget !== undefined && body.budget !== null && body.budget < 0) {
      return NextResponse.json(
        { error: "Le budget ne peut pas être négatif" },
        { status: 400 }
      );
    }

    // Valider le taux horaire si fourni
    if (body.hourly_rate !== undefined && body.hourly_rate !== null && body.hourly_rate < 0) {
      return NextResponse.json(
        { error: "Le taux horaire ne peut pas être négatif" },
        { status: 400 }
      );
    }

    // Vérifier que le parent existe si parent_id est fourni
    if (body.parent_id) {
      // Empêcher un projet d'être son propre parent
      if (body.parent_id === id) {
        return NextResponse.json(
          { error: "Un projet ne peut pas être son propre parent" },
          { status: 400 }
        );
      }

      const { data: parentProject, error: parentError } = await supabase
        .from("projects")
        .select("id, parent_id")
        .eq("id", body.parent_id)
        .single();

      if (parentError || !parentProject) {
        return NextResponse.json(
          { error: "Projet parent non trouvé" },
          { status: 400 }
        );
      }

      // Vérifier qu'on ne crée pas de cycle (le parent ne doit pas être un enfant de ce projet)
      if (parentProject.parent_id === id) {
        return NextResponse.json(
          { error: "Impossible de créer une référence circulaire" },
          { status: 400 }
        );
      }
    }

    // Valider le statut si fourni
    const validStatuses: ProjectStatus[] = ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Construire l'objet de mise à jour
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.parent_id !== undefined) updateData.parent_id = body.parent_id;
    if (body.billable !== undefined) updateData.billable = body.billable;
    if (body.hourly_rate !== undefined) updateData.hourly_rate = body.hourly_rate;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.status !== undefined) updateData.status = body.status;

    // Mettre à jour le projet
    const { data, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erreur mise à jour project:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du projet" },
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
 * DELETE /api/projects/[id]
 * Supprime un projet (et ses sous-projets si cascade)
 */
export async function DELETE(
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

    // Vérifier que le projet existe
    const { data: existingProject, error: findError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existingProject) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des time entries liées
    const { count: timeEntriesCount } = await supabase
      .from("time_entries")
      .select("*", { count: "exact", head: true })
      .eq("project_id", id);

    if (timeEntriesCount && timeEntriesCount > 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer ce projet car il contient des entrées de temps. Archivez-le plutôt."
        },
        { status: 400 }
      );
    }

    // Vérifier s'il y a des sous-projets
    const { count: childrenCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", id);

    if (childrenCount && childrenCount > 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer ce projet car il contient des sous-projets. Supprimez d'abord les sous-projets."
        },
        { status: 400 }
      );
    }

    // Supprimer le projet
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression project:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du projet" },
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
