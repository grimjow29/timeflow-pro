export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { MOCK_TAGS } from "@/lib/mock-data";
import { Tag } from "@/lib/types";

const sessionTags: Tag[] = [];

/**
 * GET /api/tags
 */
export async function GET() {
  try {
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const tags = [...MOCK_TAGS, ...sessionTags];
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
    const { name, color } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du tag est requis" },
        { status: 400 }
      );
    }

    const newTag = {
      id: `tag-${Date.now()}`,
      name: name.trim(),
      color: color || "#8b5cf6",
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    sessionTags.push(newTag);

    return NextResponse.json({ data: newTag }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
