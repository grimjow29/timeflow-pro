import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  generateTimeSuggestions,
  analyzeWeeklyPatterns,
} from "@/lib/ai/time-suggestions";
import {
  calculateProductivityScore,
  getWeeklyProgressData,
} from "@/lib/ai/productivity-score";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const goalHours = parseInt(searchParams.get("goalHours") || "40", 10);

    // Fetch user's time entries from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: entries, error: entriesError } = await supabase
      .from("time_entries")
      .select("*, project:projects(*)")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo.toISOString())
      .order("date", { ascending: false });

    if (entriesError) {
      console.error("Error fetching entries:", entriesError);
      return NextResponse.json(
        { error: "Erreur lors de la recuperation des entrees" },
        { status: 500 }
      );
    }

    // Get current date/time info
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    // Generate AI suggestions
    const suggestions = generateTimeSuggestions(
      entries || [],
      currentDay,
      currentHour
    );

    // Analyze weekly patterns
    const weeklyPatterns = analyzeWeeklyPatterns(entries || []);

    // Calculate productivity score
    const productivityScore = calculateProductivityScore(
      entries || [],
      goalHours
    );

    // Get weekly progress data
    const weeklyProgress = getWeeklyProgressData(entries || []);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        weeklyPatterns,
        productivityScore,
        weeklyProgress,
        meta: {
          entriesAnalyzed: entries?.length || 0,
          currentDay,
          currentHour,
          generatedAt: now.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("AI Suggestions API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
