export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { NextRequest, NextResponse } from "next/server";
import { getMockTimeEntries, MOCK_PROJECTS } from "@/lib/mock-data";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format, eachDayOfInterval, parseISO } from "date-fns";

interface HoursPerDay {
  date: string;
  hours: number;
}

interface HoursPerProject {
  project: string;
  hours: number;
  color: string;
}

interface AnalyticsResponse {
  hoursPerDay: HoursPerDay[];
  hoursPerProject: HoursPerProject[];
  totalHours: number;
  avgHoursPerDay: number;
  trend: number;
}

/**
 * GET /api/analytics
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
    const period = searchParams.get("period") || "week";

    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (period === "month") {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      prevStartDate = startOfMonth(subMonths(today, 1));
      prevEndDate = endOfMonth(subMonths(today, 1));
    } else {
      startDate = startOfWeek(today, { weekStartsOn: 1 });
      endDate = endOfWeek(today, { weekStartsOn: 1 });
      prevStartDate = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      prevEndDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    }

    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");
    const prevStartStr = format(prevStartDate, "yyyy-MM-dd");
    const prevEndStr = format(prevEndDate, "yyyy-MM-dd");

    // Get current period entries
    const currentEntries = getMockTimeEntries(user.id, startStr, endStr);
    const prevEntries = getMockTimeEntries(user.id, prevStartStr, prevEndStr);

    // Calculate hours per day
    const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate });
    const hoursPerDayMap = new Map<string, number>();

    daysInPeriod.forEach((day) => {
      hoursPerDayMap.set(format(day, "yyyy-MM-dd"), 0);
    });

    currentEntries.forEach((entry) => {
      const dateKey = entry.date;
      const currentHours = hoursPerDayMap.get(dateKey) || 0;
      hoursPerDayMap.set(dateKey, currentHours + entry.duration / 60);
    });

    const hoursPerDay: HoursPerDay[] = Array.from(hoursPerDayMap.entries())
      .map(([date, hours]) => ({
        date: format(parseISO(date), "EEE dd/MM"),
        hours: Math.round(hours * 100) / 100,
      }));

    // Calculate hours per project
    const hoursPerProjectMap = new Map<string, { hours: number; color: string }>();

    currentEntries.forEach((entry) => {
      const project = entry.project || { name: "Sans projet", color: "#8b5cf6" };
      const current = hoursPerProjectMap.get(project.name) || { hours: 0, color: project.color };
      hoursPerProjectMap.set(project.name, {
        hours: current.hours + entry.duration / 60,
        color: project.color,
      });
    });

    const hoursPerProject: HoursPerProject[] = Array.from(hoursPerProjectMap.entries())
      .map(([project, data]) => ({
        project,
        hours: Math.round(data.hours * 100) / 100,
        color: data.color,
      }))
      .sort((a, b) => b.hours - a.hours);

    // Calculate totals
    const totalMinutes = currentEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    const numDays = daysInPeriod.length;
    const avgHoursPerDay = Math.round((totalHours / numDays) * 100) / 100;

    // Calculate trend
    const prevTotalMinutes = prevEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const prevTotalHours = prevTotalMinutes / 60;

    let trend = 0;
    if (prevTotalHours > 0) {
      trend = Math.round(((totalHours - prevTotalHours) / prevTotalHours) * 100);
    } else if (totalHours > 0) {
      trend = 100;
    }

    const response: AnalyticsResponse = {
      hoursPerDay,
      hoursPerProject,
      totalHours,
      avgHoursPerDay,
      trend,
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
