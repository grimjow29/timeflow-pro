import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { CreateTimeEntryInput } from "@/lib/types";
import { getMockTimeEntries, addSessionTimeEntry, getSessionTimeEntries, MOCK_PROJECTS } from "@/lib/mock-data";

/**
 * GET /api/time-entries
 * Liste les entrées de temps pour l'utilisateur connecté
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
    const weekStart = searchParams.get("week_start");
    const weekEnd = searchParams.get("week_end");
    const projectId = searchParams.get("project_id");

    let entries = [
      ...getMockTimeEntries(user.id, weekStart || undefined, weekEnd || undefined),
      ...getSessionTimeEntries().filter(e => e.user_id === user.id),
    ];

    if (weekStart && weekEnd) {
      entries = entries.filter(e => e.date >= weekStart && e.date <= weekEnd);
    }

    if (projectId) {
      entries = entries.filter(e => e.project_id === projectId);
    }

    entries.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ data: entries });
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
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body: CreateTimeEntryInput = await request.json();

    if (!body.project_id || !body.date || body.duration === undefined) {
      return NextResponse.json(
        { error: "Champs requis manquants: project_id, date, duration" },
        { status: 400 }
      );
    }

    if (body.duration < 0 || body.duration > 1440) {
      return NextResponse.json(
        { error: "Durée invalide (doit être entre 0 et 1440 minutes)" },
        { status: 400 }
      );
    }

    const project = MOCK_PROJECTS.find(p => p.id === body.project_id) ||
                    MOCK_PROJECTS.flatMap(p => p.children || []).find(p => p.id === body.project_id);

    const newEntry = {
      id: `entry-${Date.now()}`,
      user_id: user.id,
      project_id: body.project_id,
      date: body.date,
      duration: body.duration,
      description: body.description || null,
      billable: body.billable ?? true,
      tags: [],
      timesheet_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project: project ? {
        id: project.id,
        name: project.name,
        color: project.color,
      } : null,
    };

    addSessionTimeEntry(newEntry);

    return NextResponse.json({ data: newEntry }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
