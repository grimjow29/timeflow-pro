import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { CreateGroupInput, Group } from "@/lib/types";

/**
 * GET /api/groups
 * Liste tous les groupes
 * Query params:
 * - include_members: inclure les membres du groupe (optionnel)
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
    const includeMembers = searchParams.get("include_members") === "true";

    // Construire la requête
    let selectQuery = `
      *,
      manager:profiles!groups_manager_id_fkey(id, name, email, avatar_url)
    `;

    if (includeMembers) {
      selectQuery += `,
        members:profiles!profiles_group_id_fkey(id, name, email, avatar_url, role)
      `;
    }

    const { data, error } = await supabase
      .from("groups")
      .select(selectQuery)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erreur récupération groups:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des groupes" },
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
 * POST /api/groups
 * Crée un nouveau groupe
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

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Permission refusée. Seuls les admins peuvent créer des groupes." },
        { status: 403 }
      );
    }

    // Parser le body
    const body: CreateGroupInput = await request.json();

    // Validation des champs requis
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du groupe est requis" },
        { status: 400 }
      );
    }

    // Créer le groupe
    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: body.name.trim(),
        manager_id: body.manager_id || null,
      })
      .select(`
        *,
        manager:profiles!groups_manager_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) {
      console.error("Erreur création group:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Un groupe avec ce nom existe déjà" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Erreur lors de la création du groupe" },
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
