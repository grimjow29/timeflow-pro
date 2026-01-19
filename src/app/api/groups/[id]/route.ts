export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/groups/[id]
 * Récupère un groupe spécifique avec ses membres
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { data, error } = await supabase
      .from("groups")
      .select(`
        *,
        manager:profiles!groups_manager_id_fkey(id, name, email, avatar_url, role),
        members:profiles!profiles_group_id_fkey(id, name, email, avatar_url, role)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Groupe non trouvé" },
          { status: 404 }
        );
      }
      console.error("Erreur récupération group:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération du groupe" },
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
 * PUT /api/groups/[id]
 * Met à jour un groupe (nom, manager)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Permission refusée. Seuls les admins peuvent modifier les groupes." },
        { status: 403 }
      );
    }

    // Parser le body
    const body = await request.json();

    // Construire l'objet de mise à jour
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (body.name.trim() === "") {
        return NextResponse.json(
          { error: "Le nom du groupe ne peut pas être vide" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.manager_id !== undefined) {
      updateData.manager_id = body.manager_id || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    // Mettre à jour le groupe
    const { data, error } = await supabase
      .from("groups")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        manager:profiles!groups_manager_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Groupe non trouvé" },
          { status: 404 }
        );
      }
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Un groupe avec ce nom existe déjà" },
          { status: 409 }
        );
      }
      console.error("Erreur mise à jour group:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du groupe" },
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
 * DELETE /api/groups/[id]
 * Supprime un groupe
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Permission refusée. Seuls les admins peuvent supprimer les groupes." },
        { status: 403 }
      );
    }

    // Vérifier si le groupe a des membres
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("group_id", id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un groupe avec des membres. Déplacez d'abord les membres." },
        { status: 400 }
      );
    }

    // Supprimer le groupe
    const { error } = await supabase
      .from("groups")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression group:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du groupe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Groupe supprimé avec succès" });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
