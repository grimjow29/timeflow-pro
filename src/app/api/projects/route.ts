export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { CreateProjectInput, Project } from "@/lib/types";
import { MOCK_PROJECTS, addSessionProject, getSessionProjects } from "@/lib/mock-data";

/**
 * GET /api/projects
 * Liste les projets avec leurs sous-projets
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const parentOnly = searchParams.get("parent_only") === "true";

    let projects = [...MOCK_PROJECTS, ...getSessionProjects()];

    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    if (parentOnly) {
      projects = projects.filter(p => !p.parent_id);
    }

    return NextResponse.json({ data: projects });
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
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body: CreateProjectInput = await request.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      );
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      color: body.color || "#8b5cf6",
      parent_id: body.parent_id || null,
      billable: body.billable ?? true,
      hourly_rate: body.hourly_rate ?? null,
      budget: body.budget ?? null,
      status: "ACTIVE" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: [],
    };

    addSessionProject(newProject);

    return NextResponse.json({ data: newProject }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// Types kept for compatibility
export type { Project };
