import { TimeEntry } from "@/lib/types";

export type ProductivityGrade = "A" | "B" | "C" | "D" | "F";
export type ProductivityTrend = "up" | "down" | "stable";

export interface ProductivityScore {
  score: number; // 0-100
  grade: ProductivityGrade;
  weeklyHours: number;
  goalHours: number;
  streak: number; // jours consecutifs avec entrees
  trend: ProductivityTrend;
  billablePercentage: number;
  completionRate: number; // % of goal achieved
}

/**
 * Calculate grade based on score
 */
function getGrade(score: number): ProductivityGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * Calculate streak of consecutive days with entries
 */
function calculateStreak(entries: TimeEntry[]): number {
  if (entries.length === 0) return 0;

  // Get unique dates and sort them descending
  const dateSet = new Set(
    entries.map((e) => new Date(e.date).toISOString().split("T")[0])
  );
  const uniqueDates = Array.from(dateSet).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today or yesterday has an entry (to start the streak)
  const latestEntry = new Date(uniqueDates[0]);
  latestEntry.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - latestEntry.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If no entry today or yesterday, streak is 0
  if (daysDiff > 1) return 0;

  // Count consecutive days
  const currentDate = latestEntry;

  for (let i = 0; i < uniqueDates.length; i++) {
    const entryDate = new Date(uniqueDates[i]);
    entryDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate trend by comparing this week to last week
 */
function calculateTrend(
  entries: TimeEntry[],
  weeklyHours: number
): ProductivityTrend {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  // Calculate last week's hours
  let lastWeekMinutes = 0;
  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    if (entryDate >= startOfLastWeek && entryDate < startOfThisWeek) {
      lastWeekMinutes += entry.duration;
    }
  });
  const lastWeekHours = lastWeekMinutes / 60;

  // Compare with threshold of 10%
  const difference = weeklyHours - lastWeekHours;
  const threshold = lastWeekHours * 0.1;

  if (difference > threshold) return "up";
  if (difference < -threshold) return "down";
  return "stable";
}

/**
 * Get entries from the current week
 */
function getWeeklyEntries(entries: TimeEntry[]): TimeEntry[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return entries.filter((entry) => new Date(entry.date) >= startOfWeek);
}

/**
 * Calculate billable percentage
 */
function calculateBillablePercentage(entries: TimeEntry[]): number {
  if (entries.length === 0) return 0;

  const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
  const billableDuration = entries
    .filter((e) => e.billable)
    .reduce((sum, e) => sum + e.duration, 0);

  return totalDuration > 0 ? (billableDuration / totalDuration) * 100 : 0;
}

/**
 * Calculate productivity score based on multiple factors
 */
export function calculateProductivityScore(
  entries: TimeEntry[],
  goalHours: number = 40
): ProductivityScore {
  // Get weekly entries
  const weeklyEntries = getWeeklyEntries(entries);

  // Calculate weekly hours
  const weeklyMinutes = weeklyEntries.reduce(
    (sum, entry) => sum + entry.duration,
    0
  );
  const weeklyHours = weeklyMinutes / 60;

  // Calculate completion rate
  const completionRate = Math.min((weeklyHours / goalHours) * 100, 100);

  // Calculate billable percentage
  const billablePercentage = calculateBillablePercentage(weeklyEntries);

  // Calculate streak
  const streak = calculateStreak(entries);

  // Calculate trend
  const trend = calculateTrend(entries, weeklyHours);

  // Calculate final score (weighted average)
  // - 50% goal completion
  // - 25% billable work
  // - 15% consistency (streak bonus)
  // - 10% trend bonus
  let score = completionRate * 0.5;
  score += billablePercentage * 0.25;
  score += Math.min(streak * 5, 15); // Max 15 points for streak
  score += trend === "up" ? 10 : trend === "stable" ? 5 : 0;

  // Cap score at 100
  score = Math.min(Math.round(score), 100);

  return {
    score,
    grade: getGrade(score),
    weeklyHours: Math.round(weeklyHours * 10) / 10,
    goalHours,
    streak,
    trend,
    billablePercentage: Math.round(billablePercentage),
    completionRate: Math.round(completionRate),
  };
}

/**
 * Get motivational message based on score
 */
export function getMotivationalMessage(score: ProductivityScore): string {
  if (score.score >= 90) {
    return "Excellent travail ! Vous etes au top de votre productivite.";
  }
  if (score.score >= 75) {
    return "Tres bien ! Continuez sur cette lancee.";
  }
  if (score.score >= 60) {
    return "Bien ! Quelques efforts supplementaires et vous atteindrez vos objectifs.";
  }
  if (score.score >= 40) {
    return "Courage ! Essayez de rester plus regulier cette semaine.";
  }
  return "C'est le moment de reprendre en main votre productivite !";
}

/**
 * Get streak message
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Commencez votre serie aujourd'hui !";
  if (streak === 1) return "1 jour ! Le debut d'une bonne habitude.";
  if (streak < 5) return `${streak} jours ! Continuez comme ca.`;
  if (streak < 10) return `${streak} jours ! Impressionnant !`;
  if (streak < 30) return `${streak} jours ! Vous etes un champion !`;
  return `${streak} jours ! Incroyable dedication !`;
}

/**
 * Calculate weekly progress data for charts
 */
export function getWeeklyProgressData(entries: TimeEntry[]): {
  day: string;
  hours: number;
}[] {
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const dailyHours: number[] = [0, 0, 0, 0, 0, 0, 0];

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    if (entryDate >= startOfWeek) {
      const dayIndex = entryDate.getDay();
      dailyHours[dayIndex] += entry.duration / 60;
    }
  });

  return dayNames.map((day, index) => ({
    day,
    hours: Math.round(dailyHours[index] * 10) / 10,
  }));
}
