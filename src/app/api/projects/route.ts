import { getAuthUser, getSupabaseClient } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { CreateProjectInput, Project } from "@/lib/types";

/**
 * GET /api/projects
 * Liste les projets avec leurs sous-projets
 * Query params:
 * - status: filtrer par statut (ACTIVE, PAUSED, COMPLETED, ARCHIVED)
 * - parent_only: true pour ne récupérer que les projets parents (sans parent_id)
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

    // Récupérer les paramètres de query
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const parentOnly = searchParams.get("parent_only") === "true";

    // Construire la requête pour les projets parents
    let query = supabase
      .from("projects")
      .select("*")
      .order("name", { ascending: true });

    // Filtrer par statut si spécifié
    if (status) {
      query = query.eq("status", status);
    }

    // Filtrer les projets parents uniquement si demandé
    if (parentOnly) {
      query = query.is("parent_id", null);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error("Erreur récupération projects:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des projets" },
        { status: 500 }
      );
    }

    // Organiser les projets avec leurs sous-projets
    const projectsWithChildren = organizeProjectsHierarchy(projects || []);

    return NextResponse.json({ data: projectsWithChildren });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Crée un nouveau projet
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
    const body: CreateProjectInput = await request.json();

    // Validation des champs requis
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      );
    }

    // Valider le budget si fourni
    if (body.budget !== undefined && body.budget < 0) {
      return NextResponse.json(
        { error: "Le budget ne peut pas être négatif" },
        { status: 400 }
      );
    }

    // Valider le taux horaire si fourni
    if (body.hourly_rate !== undefined && body.hourly_rate < 0) {
      return NextResponse.json(
        { error: "Le taux horaire ne peut pas être négatif" },
        { status: 400 }
      );
    }

    // Vérifier que le parent existe si parent_id est fourni
    if (body.parent_id) {
      const { data: parentProject, error: parentError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", body.parent_id)
        .single();

      if (parentError || !parentProject) {
        return NextResponse.json(
          { error: "Projet parent non trouvé" },
          { status: 400 }
        );
      }
    }

    // Créer le projet
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        color: body.color || "#8b5cf6",
        parent_id: body.parent_id || null,
        billable: body.billable ?? true,
        hourly_rate: body.hourly_rate ?? null,
        budget: body.budget ?? null,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création project:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du projet" },
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

/**
 * Organise les projets en hiérarchie (parents avec children)
 */
function organizeProjectsHierarchy(projects: Project[]): Project[] {
  const projectMap = new Map<string, Project & { children: Project[] }>();
  const rootProjects: (Project & { children: Project[] })[] = [];

  // Initialiser tous les projets avec un tableau children vide
  projects.forEach((project) => {
    projectMap.set(project.id, { ...project, children: [] });
  });

  // Organiser la hiérarchie
  projects.forEach((project) => {
    const projectWithChildren = projectMap.get(project.id)!;

    if (project.parent_id && projectMap.has(project.parent_id)) {
      // Ajouter comme enfant du parent
      projectMap.get(project.parent_id)!.children.push(projectWithChildren);
    } else if (!project.parent_id) {
      // C'est un projet racine
      rootProjects.push(projectWithChildren);
    }
  });

  return rootProjects;
}
