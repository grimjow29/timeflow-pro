export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { MOCK_USERS, MOCK_GROUPS } from "@/lib/mock-data";

// Session storage for new users
const sessionUsers: Array<{
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}> = [];

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

    // Merge mock users and session users
    const allUsers = [...MOCK_USERS, ...sessionUsers];

    let users = allUsers.map(u => ({
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

/**
 * POST /api/users
 * Créer un nouvel utilisateur
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

    const body = await request.json();
    const { email, name, role, group_id } = body;

    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email et nom sont requis" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "MANAGER", "EMPLOYEE", "VALIDATOR"].includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const allUsers = [...MOCK_USERS, ...sessionUsers];
    if (allUsers.some(u => u.email === email)) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      avatar_url: null,
      role,
      group_id: group_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    sessionUsers.push(newUser);

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
