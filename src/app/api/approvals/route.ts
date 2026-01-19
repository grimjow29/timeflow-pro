export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { getMockApprovals, getMockTimeEntries, MOCK_USERS, isApprovalProcessed } from "@/lib/mock-data";
import { TimesheetApproval } from "@/lib/types";

const sessionApprovals: TimesheetApproval[] = [];

/**
 * GET /api/approvals
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
    const statusFilter = searchParams.get("status");

    let approvals = [...getMockApprovals(user.id), ...sessionApprovals];

    // Filtrer les approbations déjà traitées (en mode demo)
    approvals = approvals.filter(a => !isApprovalProcessed(a.id));

    if (statusFilter) {
      approvals = approvals.filter(a => a.status === statusFilter);
    }

    // Add user and entries data
    const enrichedApprovals = approvals.map(approval => {
      const approvalUser = MOCK_USERS.find(u => u.id === approval.user_id) || {
        id: user.id,
        name: user.user_metadata?.name || "Utilisateur",
        email: user.email || "",
        avatar_url: null,
      };

      const validator = MOCK_USERS.find(u => u.id === approval.validator_id);

      return {
        ...approval,
        user: approvalUser,
        validator: validator || null,
        totalHours: `${Math.floor(approval.total_hours)}:${String(Math.round((approval.total_hours % 1) * 60)).padStart(2, "0")}`,
        breakdown: [
          { project: "Client ABC Corp", color: "#8b5cf6", hours: "20h00" },
          { project: "App Mobile XYZ", color: "#ec4899", hours: "10h30" },
          { project: "Interne", color: "#10b981", hours: "8h00" },
        ],
      };
    });

    return NextResponse.json({ data: enrichedApprovals });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/approvals
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
    const { week_start, week_end } = body;

    if (!week_start || !week_end) {
      return NextResponse.json(
        { error: "Champs requis manquants: week_start, week_end" },
        { status: 400 }
      );
    }

    // Get time entries for this week
    const entries = getMockTimeEntries(user.id, week_start, week_end);
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours = totalMinutes / 60;

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Aucune entrée de temps pour cette semaine" },
        { status: 400 }
      );
    }

    const newApproval: TimesheetApproval = {
      id: `approval-${Date.now()}`,
      user_id: user.id,
      validator_id: null,
      week_start,
      week_end,
      total_hours: totalHours,
      status: "PENDING" as const,
      comments: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    sessionApprovals.push(newApproval);

    return NextResponse.json({ data: newApproval }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
