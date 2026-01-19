export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helper";
import { getMockTimeEntries } from "@/lib/mock-data";
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
    // Get authenticated user (MODE DEMO)
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const goalHours = parseInt(searchParams.get("goalHours") || "40", 10);

    // Fetch user's time entries from the last 30 days (MODE DEMO: using mock data)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = getMockTimeEntries(
      user.id,
      thirtyDaysAgo.toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    // Get current date/time info
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    // Generate AI suggestions
    const suggestions = generateTimeSuggestions(
      entries as unknown as Parameters<typeof generateTimeSuggestions>[0],
      currentDay,
      currentHour
    );

    // Analyze weekly patterns
    const weeklyPatterns = analyzeWeeklyPatterns(entries as unknown as Parameters<typeof analyzeWeeklyPatterns>[0]);

    // Calculate productivity score
    const productivityScore = calculateProductivityScore(
      entries as unknown as Parameters<typeof calculateProductivityScore>[0],
      goalHours
    );

    // Get weekly progress data
    const weeklyProgress = getWeeklyProgressData(entries as unknown as Parameters<typeof getWeeklyProgressData>[0]);

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
