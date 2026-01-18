import { getAuthUser, getSupabaseClient } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users
 * Liste les utilisateurs avec leurs groupes
 * Query params:
 * - group_id: filtrer par groupe (optionnel)
 * - role: filtrer par rôle (optionnel)
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
    const groupId = searchParams.get("group_id");
    const role = searchParams.get("role");

    // Construire la requête
    let query = supabase
      .from("profiles")
      .select(`
        *,
        group:groups(id, name)
      `)
      .order("name", { ascending: true });

    // Filtrer par groupe si spécifié
    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    // Filtrer par rôle si spécifié
    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur récupération users:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des utilisateurs" },
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
