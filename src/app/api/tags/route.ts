import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/tags
 * Liste les tags de l'utilisateur connecte
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Verifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 }
      );
    }

    // Recuperer les tags de l'utilisateur
    const { data: tags, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erreur recuperation tags:", error);
      return NextResponse.json(
        { error: "Erreur lors de la recuperation des tags" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: tags });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Cree un nouveau tag
 * Body: { name: string, color: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 }
      );
    }

    // Parser le body
    const body = await request.json();
    const { name, color } = body;

    // Validation des champs requis
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du tag est requis" },
        { status: 400 }
      );
    }

    if (!color || color.trim() === "") {
      return NextResponse.json(
        { error: "La couleur du tag est requise" },
        { status: 400 }
      );
    }

    // Verifier que le tag n'existe pas deja
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name.trim())
      .single();

    if (existingTag) {
      return NextResponse.json(
        { error: "Un tag avec ce nom existe deja" },
        { status: 400 }
      );
    }

    // Creer le tag
    const { data, error } = await supabase
      .from("tags")
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: color.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur creation tag:", error);
      return NextResponse.json(
        { error: "Erreur lors de la creation du tag" },
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
