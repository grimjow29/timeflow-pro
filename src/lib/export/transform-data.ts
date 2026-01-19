import { TimeEntry, Project } from "@/lib/types";
import { TimesheetData, TimesheetEntry } from "./pdf-generator";

/**
 * Transforme les données de time entries en format pour le PDF/Excel
 */
export function transformToTimesheetData(
  entries: TimeEntry[],
  projects: Project[],
  userName: string,
  weekStart: Date,
  weekEnd: Date
): TimesheetData {
  // Créer une map des projets par ID
  const projectMap = new Map<string, Project>();
  projects.forEach((project) => {
    projectMap.set(project.id, project);
    project.children?.forEach((child) => {
      projectMap.set(child.id, child);
    });
  });

  // Regrouper les entrées par projet
  const projectEntries = new Map<string, { [key: string]: number }>();

  entries.forEach((entry) => {
    const projectId = entry.project_id;
    if (!projectEntries.has(projectId)) {
      projectEntries.set(projectId, {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      });
    }

    const projectData = projectEntries.get(projectId)!;
    const entryDate = new Date(entry.date);
    const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convertir le jour de la semaine en clé
    const dayMap: { [key: number]: string } = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };

    const dayKey = dayMap[dayOfWeek];
    if (dayKey) {
      projectData[dayKey] += entry.duration;
    }
  });

  // Transformer en tableau d'entrées
  const timesheetEntries: TimesheetEntry[] = [];
  let totalHours = 0;

  projectEntries.forEach((data, projectId) => {
    const project = projectMap.get(projectId);
    const projectName = project?.name || "Projet inconnu";

    const total =
      data.monday +
      data.tuesday +
      data.wednesday +
      data.thursday +
      data.friday +
      data.saturday +
      data.sunday;

    totalHours += total;

    timesheetEntries.push({
      project: projectName,
      monday: data.monday,
      tuesday: data.tuesday,
      wednesday: data.wednesday,
      thursday: data.thursday,
      friday: data.friday,
      saturday: data.saturday,
      sunday: data.sunday,
      total,
    });
  });

  // Trier par nom de projet
  timesheetEntries.sort((a, b) => a.project.localeCompare(b.project));

  return {
    userName,
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    entries: timesheetEntries,
    totalHours,
  };
}

/**
 * Obtient le début et la fin de la semaine en cours
 */
export function getCurrentWeek(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday

  const start = new Date(now);
  start.setDate(now.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Obtient le début et la fin du mois en cours
 */
export function getCurrentMonth(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

/**
 * Formate une date en YYYY-MM-DD
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Formate une date en format lisible français
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
