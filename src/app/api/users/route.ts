import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { MOCK_USERS, MOCK_GROUPS } from "@/lib/mock-data";

/**
 * GET /api/users
 * Liste les utilisateurs avec leurs groupes
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
    const groupId = searchParams.get("group_id");
    const role = searchParams.get("role");

    let users = MOCK_USERS.map(u => ({
      ...u,
      group: MOCK_GROUPS.find(g => g.id === u.group_id) || null,
    }));

    if (groupId) {
      users = users.filter(u => u.group_id === groupId);
    }

    if (role) {
      users = users.filter(u => u.role === role);
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
