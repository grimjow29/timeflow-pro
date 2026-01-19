import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { submitTimesheet, getSubmittedTimesheets, isWeekSubmitted } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("tf_session");
  if (!sessionCookie?.value) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.expires && session.expires > Date.now()) {
      return session.user;
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const timesheets = getSubmittedTimesheets(user.id);
    return NextResponse.json({ data: timesheets });
  } catch (error) {
    console.error("Erreur GET timesheets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des timesheets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { week_start, week_end, total_hours, entry_ids } = body;

    if (!week_start || !week_end) {
      return NextResponse.json(
        { error: "Les dates de début et fin de semaine sont requises" },
        { status: 400 }
      );
    }

    // Vérifier si la semaine n'est pas déjà soumise
    if (isWeekSubmitted(user.id, week_start)) {
      return NextResponse.json(
        { error: "Cette semaine a déjà été soumise pour validation" },
        { status: 400 }
      );
    }

    // Soumettre le timesheet
    const timesheet = submitTimesheet({
      user_id: user.id,
      week_start,
      week_end,
      total_hours: total_hours || 0,
      entry_ids: entry_ids || [],
    });

    return NextResponse.json({
      data: timesheet,
      message: "Timesheet soumis avec succès pour validation",
    });
  } catch (error) {
    console.error("Erreur POST timesheet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission du timesheet" },
      { status: 500 }
    );
  }
}
