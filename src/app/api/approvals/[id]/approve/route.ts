export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/approvals/[id]/approve
 * Approuve un timesheet
 * Body: { comments?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Vérifier le rôle de l'utilisateur
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, group_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    // Seuls les admins, validators et managers peuvent approuver
    if (!["ADMIN", "VALIDATOR", "MANAGER"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      );
    }

    // Récupérer le timesheet
    const { data: approval, error: fetchError } = await supabase
      .from("timesheet_approvals")
      .select("*, user:profiles!timesheet_approvals_user_id_fkey(group_id)")
      .eq("id", id)
      .single();

    if (fetchError || !approval) {
      return NextResponse.json(
        { error: "Timesheet non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le timesheet est en attente
    if (approval.status !== "PENDING") {
      return NextResponse.json(
        { error: `Ce timesheet ne peut pas être approuvé (statut: ${approval.status})` },
        { status: 400 }
      );
    }

    // Si manager, vérifier qu'il gère ce groupe
    if (profile.role === "MANAGER") {
      const timesheetUserGroupId = approval.user?.group_id;
      if (timesheetUserGroupId !== profile.group_id) {
        return NextResponse.json(
          { error: "Vous ne pouvez approuver que les timesheets de votre groupe" },
          { status: 403 }
        );
      }
    }

    // Parser le body pour les commentaires optionnels
    let comments = null;
    try {
      const body = await request.json();
      comments = body.comments || null;
    } catch {
      // Body vide ou invalide, ignorer
    }

    // Mettre à jour le timesheet
    const { data, error } = await supabase
      .from("timesheet_approvals")
      .update({
        status: "APPROVED",
        validator_id: user.id,
        reviewed_at: new Date().toISOString(),
        comments,
      })
      .eq("id", id)
      .select(`
        *,
        user:profiles!timesheet_approvals_user_id_fkey(id, name, email),
        validator:profiles!timesheet_approvals_validator_id_fkey(id, name, email)
      `)
      .single();

    if (error) {
      console.error("Erreur approbation:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'approbation" },
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
