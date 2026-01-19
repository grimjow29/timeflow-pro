export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const validRoles: UserRole[] = ["ADMIN", "MANAGER", "EMPLOYEE", "VALIDATOR"];

/**
 * GET /api/users/[id]
 * Récupère un utilisateur spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }


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
      .from("profiles")
      .select(`
        *,
        group:groups(id, name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
      console.error("Erreur récupération user:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération de l'utilisateur" },
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
 * PUT /api/users/[id]
 * Met à jour un utilisateur (rôle, groupe, nom)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }


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
    const { data: currentUserProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single() as {
        data: { role: UserRole } | null;
        error: unknown
      };

    if (currentUserProfile?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Permission refusée. Seuls les admins peuvent modifier les utilisateurs." },
        { status: 403 }
      );
    }

    // Parser le body
    const body = await request.json();

    // Construire l'objet de mise à jour
    const updateData: Record<string, unknown> = {};

    if (body.role !== undefined) {
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { error: `Rôle invalide. Valeurs acceptées: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }

    if (body.group_id !== undefined) {
      // Vérifier que le groupe existe si un ID est fourni
      if (body.group_id) {
        const { data: groupExists } = await supabase
          .from("groups")
          .select("id")
          .eq("id", body.group_id)
          .single() as {
            data: { id: string } | null;
            error: unknown
          };

        if (!groupExists) {
          return NextResponse.json(
            { error: "Groupe non trouvé" },
            { status: 404 }
          );
        }
      }
      updateData.group_id = body.group_id || null;
    }

    if (body.name !== undefined) {
      if (body.name.trim() === "") {
        return NextResponse.json(
          { error: "Le nom ne peut pas être vide" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData as never)
      .eq("id", id)
      .select(`
        *,
        group:groups(id, name)
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
      console.error("Erreur mise à jour user:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de l'utilisateur" },
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
