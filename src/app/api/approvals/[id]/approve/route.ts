export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { markApprovalAsProcessed } from "@/lib/mock-data";

/**
 * POST /api/approvals/[id]/approve
 * Approuve un timesheet (MODE DEMO)
 * Body: { comments?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthUser();
    const { id } = await params;

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Parser le body pour les commentaires optionnels
    let comments = null;
    try {
      const body = await request.json();
      comments = body.comments || null;
    } catch {
      // Body vide ou invalide, ignorer
    }

    // MODE DEMO: Marquer l'approbation comme traitée
    markApprovalAsProcessed(id);

    // MODE DEMO: Simuler l'approbation
    const approvedTimesheet = {
      id,
      status: "APPROVED",
      validator_id: user.id,
      reviewed_at: new Date().toISOString(),
      comments,
    };

    return NextResponse.json({ data: approvedTimesheet });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
