export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { getMockApprovals, getMockTimeEntries } from "@/lib/mock-data";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/approvals/[id]
 * Récupère les détails d'un timesheet spécifique (MODE DEMO)
 */
export async function GET(
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

    // MODE DEMO: Récupérer le timesheet mock
    const approvals = getMockApprovals(user.id);
    const approval = approvals.find(a => a.id === id);

    if (!approval) {
      return NextResponse.json(
        { error: "Timesheet non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les entrées de temps pour cette période
    const entries = getMockTimeEntries(
      user.id,
      approval.week_start,
      approval.week_end
    );

    // Calculer les stats
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);

    return NextResponse.json({
      data: {
        ...approval,
        entries,
        totalHours: `${Math.floor(totalMinutes / 60)}:${String(
          totalMinutes % 60
        ).padStart(2, "0")}`,
      },
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
