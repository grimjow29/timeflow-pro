import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
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
 * Returns analytics data for the authenticated user
 * Query params:
 * - period: "week" | "month" (default: "week")
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
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

    // Get period parameter
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
      // Default to week
      startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      endDate = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
      prevStartDate = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      prevEndDate = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    }

    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");
    const prevStartStr = format(prevStartDate, "yyyy-MM-dd");
    const prevEndStr = format(prevEndDate, "yyyy-MM-dd");

    // Fetch current period time entries
    const { data: currentEntries, error: currentError } = await supabase
      .from("time_entries")
      .select(`
        *,
        project:projects(id, name, color)
      `)
      .eq("user_id", user.id)
      .gte("date", startStr)
      .lte("date", endStr);

    if (currentError) {
      console.error("Error fetching current entries:", currentError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des données" },
        { status: 500 }
      );
    }

    // Fetch previous period time entries for trend calculation
    const { data: prevEntries, error: prevError } = await supabase
      .from("time_entries")
      .select("duration")
      .eq("user_id", user.id)
      .gte("date", prevStartStr)
      .lte("date", prevEndStr);

    if (prevError) {
      console.error("Error fetching previous entries:", prevError);
    }

    // Calculate hours per day
    const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate });
    const hoursPerDayMap = new Map<string, number>();

    // Initialize all days with 0
    daysInPeriod.forEach((day) => {
      hoursPerDayMap.set(format(day, "yyyy-MM-dd"), 0);
    });

    // Sum up hours per day
    currentEntries?.forEach((entry) => {
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

    currentEntries?.forEach((entry) => {
      const projectName = entry.project?.name || "Sans projet";
      const projectColor = entry.project?.color || "#8b5cf6";
      const current = hoursPerProjectMap.get(projectName) || { hours: 0, color: projectColor };
      hoursPerProjectMap.set(projectName, {
        hours: current.hours + entry.duration / 60,
        color: projectColor,
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
    const totalMinutes = currentEntries?.reduce((sum, entry) => sum + entry.duration, 0) || 0;
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    const numDays = daysInPeriod.length;
    const avgHoursPerDay = Math.round((totalHours / numDays) * 100) / 100;

    // Calculate trend
    const prevTotalMinutes = prevEntries?.reduce((sum, entry) => sum + entry.duration, 0) || 0;
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
