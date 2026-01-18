import { TimeEntry } from "@/lib/types";

export interface TimeSuggestion {
  projectId: string;
  projectName: string;
  suggestedDuration: number; // minutes
  confidence: number; // 0-1
  reason: string;
}

interface ProjectPattern {
  projectId: string;
  projectName: string;
  totalEntries: number;
  totalDuration: number;
  averageDuration: number;
  dayFrequency: Map<number, number>; // day -> count
  hourFrequency: Map<number, number>; // hour -> count
}

/**
 * Analyze time entry patterns for a specific project
 */
function analyzeProjectPatterns(
  entries: TimeEntry[],
  projectId: string,
  projectName: string
): ProjectPattern {
  const projectEntries = entries.filter((e) => e.project_id === projectId);

  const dayFrequency = new Map<number, number>();
  const hourFrequency = new Map<number, number>();
  let totalDuration = 0;

  projectEntries.forEach((entry) => {
    const date = new Date(entry.date);
    const day = date.getDay();
    const hour = date.getHours();

    dayFrequency.set(day, (dayFrequency.get(day) || 0) + 1);
    hourFrequency.set(hour, (hourFrequency.get(hour) || 0) + 1);
    totalDuration += entry.duration;
  });

  return {
    projectId,
    projectName,
    totalEntries: projectEntries.length,
    totalDuration,
    averageDuration:
      projectEntries.length > 0 ? totalDuration / projectEntries.length : 0,
    dayFrequency,
    hourFrequency,
  };
}

/**
 * Calculate confidence based on pattern matching
 */
function calculateConfidence(
  pattern: ProjectPattern,
  currentDay: number,
  currentHour: number,
  totalEntries: number
): number {
  if (pattern.totalEntries === 0) return 0;

  // Weight factors
  const dayWeight = 0.4;
  const hourWeight = 0.3;
  const frequencyWeight = 0.3;

  // Day match score (how often this project is worked on this day)
  const dayCount = pattern.dayFrequency.get(currentDay) || 0;
  const maxDayCount = Math.max(...Array.from(pattern.dayFrequency.values()), 1);
  const dayScore = dayCount / maxDayCount;

  // Hour match score (how often this project is worked on at this hour)
  const hourCount = pattern.hourFrequency.get(currentHour) || 0;
  const maxHourCount = Math.max(
    ...Array.from(pattern.hourFrequency.values()),
    1
  );
  const hourScore = hourCount / maxHourCount;

  // Overall frequency score (how often this project appears in history)
  const frequencyScore = Math.min(pattern.totalEntries / totalEntries, 1);

  return (
    dayScore * dayWeight + hourScore * hourWeight + frequencyScore * frequencyWeight
  );
}

/**
 * Generate reason string based on patterns
 */
function generateReason(
  pattern: ProjectPattern,
  currentDay: number,
  currentHour: number
): string {
  const dayNames = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  const dayCount = pattern.dayFrequency.get(currentDay) || 0;
  const hourCount = pattern.hourFrequency.get(currentHour) || 0;

  if (dayCount > 3 && hourCount > 2) {
    return `Vous travaillez souvent sur ce projet le ${dayNames[currentDay]} vers ${currentHour}h`;
  } else if (dayCount > 3) {
    return `Vous travaillez souvent sur ce projet le ${dayNames[currentDay]}`;
  } else if (hourCount > 2) {
    return `Vous travaillez souvent sur ce projet vers ${currentHour}h`;
  } else if (pattern.totalEntries > 5) {
    return `Projet frequent dans votre historique`;
  }

  return `Basé sur votre historique récent`;
}

/**
 * Round duration to nearest 15 minutes
 */
function roundDuration(duration: number): number {
  return Math.round(duration / 15) * 15;
}

/**
 * Generate AI-powered time suggestions based on user patterns
 */
export function generateTimeSuggestions(
  entries: TimeEntry[],
  currentDay: number, // 0-6 (dimanche-samedi)
  currentHour: number // 0-23
): TimeSuggestion[] {
  if (entries.length === 0) return [];

  // Group entries by project
  const projectMap = new Map<string, { id: string; name: string }>();
  entries.forEach((entry) => {
    if (entry.project && !projectMap.has(entry.project_id)) {
      projectMap.set(entry.project_id, {
        id: entry.project_id,
        name: entry.project.name,
      });
    }
  });

  // Analyze patterns for each project
  const suggestions: TimeSuggestion[] = [];

  projectMap.forEach((project) => {
    const pattern = analyzeProjectPatterns(entries, project.id, project.name);

    if (pattern.totalEntries === 0) return;

    const confidence = calculateConfidence(
      pattern,
      currentDay,
      currentHour,
      entries.length
    );

    // Only suggest if confidence is above threshold
    if (confidence > 0.2) {
      suggestions.push({
        projectId: project.id,
        projectName: project.name,
        suggestedDuration: roundDuration(pattern.averageDuration),
        confidence,
        reason: generateReason(pattern, currentDay, currentHour),
      });
    }
  });

  // Sort by confidence (highest first) and limit to top 5
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Get the most likely project for the current time
 */
export function getMostLikelySuggestion(
  entries: TimeEntry[],
  currentDay: number,
  currentHour: number
): TimeSuggestion | null {
  const suggestions = generateTimeSuggestions(entries, currentDay, currentHour);
  return suggestions.length > 0 ? suggestions[0] : null;
}

/**
 * Analyze weekly patterns for a user
 */
export function analyzeWeeklyPatterns(entries: TimeEntry[]): {
  busiestDay: string;
  averageHoursPerDay: number;
  mostProductiveHour: number;
} {
  const dayNames = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  const dayTotals = new Map<number, number>();
  const hourTotals = new Map<number, number>();
  const dayCount = new Map<number, number>();

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const day = date.getDay();
    const hour = date.getHours();

    dayTotals.set(day, (dayTotals.get(day) || 0) + entry.duration);
    dayCount.set(day, (dayCount.get(day) || 0) + 1);
    hourTotals.set(hour, (hourTotals.get(hour) || 0) + entry.duration);
  });

  // Find busiest day
  let busiestDay = 1; // Monday by default
  let maxDuration = 0;
  dayTotals.forEach((duration, day) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      busiestDay = day;
    }
  });

  // Calculate average hours per day
  let totalMinutes = 0;
  let daysWorked = 0;
  dayTotals.forEach((duration) => {
    totalMinutes += duration;
    daysWorked++;
  });
  const averageHoursPerDay = daysWorked > 0 ? totalMinutes / 60 / daysWorked : 0;

  // Find most productive hour
  let mostProductiveHour = 9; // 9am by default
  let maxHourDuration = 0;
  hourTotals.forEach((duration, hour) => {
    if (duration > maxHourDuration) {
      maxHourDuration = duration;
      mostProductiveHour = hour;
    }
  });

  return {
    busiestDay: dayNames[busiestDay],
    averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
    mostProductiveHour,
  };
}
