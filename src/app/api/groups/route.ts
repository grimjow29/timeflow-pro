export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { CreateGroupInput } from "@/lib/types";
import { MOCK_GROUPS, MOCK_USERS } from "@/lib/mock-data";

/**
 * GET /api/groups
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
    const includeMembers = searchParams.get("include_members") === "true";

    const groups = MOCK_GROUPS.map(g => {
      const manager = MOCK_USERS.find(u => u.id === g.manager_id);
      const result: {
        id: string;
        name: string;
        manager_id: string | null;
        created_at: string;
        updated_at: string;
        manager: { id: string; name: string; email: string; avatar_url: string | null } | null;
        members?: Array<{ id: string; name: string; email: string; avatar_url: string | null; role: string }>;
      } = {
        ...g,
        manager: manager ? { id: manager.id, name: manager.name, email: manager.email, avatar_url: manager.avatar_url } : null,
      };

      if (includeMembers) {
        result.members = MOCK_USERS.filter(u => u.group_id === g.id).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar_url: u.avatar_url,
          role: u.role,
        }));
      }

      return result;
    });

    return NextResponse.json({ data: groups });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
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

    const body: CreateGroupInput = await request.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du groupe est requis" },
        { status: 400 }
      );
    }

    const newGroup = {
      id: `group-${Date.now()}`,
      name: body.name.trim(),
      manager_id: body.manager_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      manager: null,
    };

    return NextResponse.json({ data: newGroup }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
