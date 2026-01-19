// Données de démonstration pour TimeFlow Pro

export const MOCK_PROJECTS = [
  {
    id: "proj-1",
    name: "Client ABC Corp",
    description: "Refonte du site web corporate",
    color: "#8b5cf6",
    parent_id: null,
    billable: true,
    hourly_rate: 95,
    budget: 15000,
    status: "ACTIVE",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    children: [
      {
        id: "proj-1-1",
        name: "Design UI/UX",
        description: "Maquettes et prototypes",
        color: "#a78bfa",
        parent_id: "proj-1",
        billable: true,
        hourly_rate: 95,
        budget: 5000,
        status: "ACTIVE",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        children: [],
      },
      {
        id: "proj-1-2",
        name: "Développement Frontend",
        description: "Intégration React/Next.js",
        color: "#c4b5fd",
        parent_id: "proj-1",
        billable: true,
        hourly_rate: 95,
        budget: 8000,
        status: "ACTIVE",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        children: [],
      },
    ],
  },
  {
    id: "proj-2",
    name: "App Mobile XYZ",
    description: "Application iOS & Android",
    color: "#ec4899",
    parent_id: null,
    billable: true,
    hourly_rate: 110,
    budget: 25000,
    status: "ACTIVE",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    children: [],
  },
  {
    id: "proj-3",
    name: "Maintenance Site E-commerce",
    description: "Support et évolutions",
    color: "#10b981",
    parent_id: null,
    billable: true,
    hourly_rate: 75,
    budget: 5000,
    status: "ACTIVE",
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z",
    children: [],
  },
  {
    id: "proj-4",
    name: "Interne - Formation",
    description: "Veille technologique et formation",
    color: "#f59e0b",
    parent_id: null,
    billable: false,
    hourly_rate: null,
    budget: null,
    status: "ACTIVE",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    children: [],
  },
  {
    id: "proj-5",
    name: "Interne - Réunions",
    description: "Réunions internes et clients",
    color: "#6366f1",
    parent_id: null,
    billable: false,
    hourly_rate: null,
    budget: null,
    status: "ACTIVE",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    children: [],
  },
];

// Générer des entrées de temps pour les 2 dernières semaines
function generateTimeEntries(userId: string) {
  const entries = [];
  const today = new Date();
  const projects = ["proj-1", "proj-1-1", "proj-1-2", "proj-2", "proj-3", "proj-4", "proj-5"];
  const descriptions = [
    "Développement de la nouvelle fonctionnalité",
    "Réunion client - point d'avancement",
    "Code review et corrections",
    "Design des maquettes",
    "Tests et débogage",
    "Documentation technique",
    "Intégration API",
    "Optimisation des performances",
    "Formation équipe",
    "Planification sprint",
  ];

  // Générer des entrées pour les 14 derniers jours
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Pas d'entrées le weekend
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // 2-4 entrées par jour
    const numEntries = Math.floor(Math.random() * 3) + 2;

    for (let j = 0; j < numEntries; j++) {
      const projectId = projects[Math.floor(Math.random() * projects.length)];
      const project = MOCK_PROJECTS.find(p => p.id === projectId) ||
                      MOCK_PROJECTS.flatMap(p => p.children || []).find(p => p.id === projectId);

      entries.push({
        id: `entry-${date.toISOString().split('T')[0]}-${j}`,
        user_id: userId,
        project_id: projectId,
        date: date.toISOString().split('T')[0],
        duration: [30, 60, 90, 120, 180, 240][Math.floor(Math.random() * 6)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        billable: project?.billable ?? true,
        tags: [],
        timesheet_id: null,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
        project: project ? {
          id: project.id,
          name: project.name,
          color: project.color,
        } : null,
      });
    }
  }

  return entries;
}

export function getMockTimeEntries(userId: string, weekStart?: string, weekEnd?: string) {
  let entries = generateTimeEntries(userId);

  if (weekStart && weekEnd) {
    entries = entries.filter(e => e.date >= weekStart && e.date <= weekEnd);
  }

  return entries;
}

export const MOCK_GROUPS = [
  {
    id: "group-1",
    name: "Équipe Développement",
    manager_id: "user-manager-1",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
  {
    id: "group-2",
    name: "Équipe Design",
    manager_id: "user-manager-2",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
];

export const MOCK_USERS = [
  {
    id: "user-1",
    email: "marie.dupont@company.com",
    name: "Marie Dupont",
    avatar_url: null,
    role: "ADMIN",
    group_id: "group-1",
    weekly_goal_hours: 40,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
  {
    id: "user-2",
    email: "jean.martin@company.com",
    name: "Jean Martin",
    avatar_url: null,
    role: "EMPLOYEE",
    group_id: "group-1",
    weekly_goal_hours: 40,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
  {
    id: "user-3",
    email: "sophie.bernard@company.com",
    name: "Sophie Bernard",
    avatar_url: null,
    role: "MANAGER",
    group_id: "group-2",
    weekly_goal_hours: 35,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
];

export const MOCK_TAGS = [
  { id: "tag-1", name: "Urgent", color: "#ef4444", user_id: null, created_at: "2024-01-01T10:00:00Z" },
  { id: "tag-2", name: "Bug Fix", color: "#f59e0b", user_id: null, created_at: "2024-01-01T10:00:00Z" },
  { id: "tag-3", name: "Feature", color: "#10b981", user_id: null, created_at: "2024-01-01T10:00:00Z" },
  { id: "tag-4", name: "Meeting", color: "#6366f1", user_id: null, created_at: "2024-01-01T10:00:00Z" },
];

export function getMockApprovals(userId: string) {
  const today = new Date();
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - today.getDay() - 6);

  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - today.getDay() + 1);

  return [
    {
      id: "approval-1",
      user_id: userId,
      validator_id: "user-3",
      week_start: lastMonday.toISOString().split('T')[0],
      week_end: new Date(lastMonday.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_hours: 38.5,
      status: "APPROVED",
      comments: "Bon travail cette semaine!",
      submitted_at: new Date(lastMonday.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reviewed_at: new Date(lastMonday.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: lastMonday.toISOString(),
      updated_at: lastMonday.toISOString(),
    },
    {
      id: "approval-2",
      user_id: userId,
      validator_id: null,
      week_start: thisMonday.toISOString().split('T')[0],
      week_end: new Date(thisMonday.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_hours: 38.5,
      status: "PENDING",
      comments: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      created_at: thisMonday.toISOString(),
      updated_at: thisMonday.toISOString(),
    },
  ];
}

// Storage local pour les approbations traitées (approved/rejected)
const processedApprovalIds: Set<string> = new Set();

export function markApprovalAsProcessed(id: string) {
  processedApprovalIds.add(id);
}

export function isApprovalProcessed(id: string): boolean {
  return processedApprovalIds.has(id);
}

export function getProcessedApprovalIds(): string[] {
  return Array.from(processedApprovalIds);
}

// Storage local pour les données créées pendant la session
const sessionTimeEntries: Array<{
  id: string;
  user_id: string;
  project_id: string;
  date: string;
  duration: number;
  description: string | null;
  billable: boolean;
  tags: string[];
  timesheet_id: string | null;
  created_at: string;
  updated_at: string;
  project: { id: string; name: string; color: string } | null;
}> = [];

const sessionProjects: Array<{
  id: string;
  name: string;
  description?: string;
  color: string;
  parent_id: string | null;
  billable: boolean;
  hourly_rate: number | null;
  budget: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  children?: unknown[];
}> = [];

export function addSessionTimeEntry(entry: {
  id: string;
  user_id: string;
  project_id: string;
  date: string;
  duration: number;
  description: string | null;
  billable: boolean;
  tags: string[];
  timesheet_id: string | null;
  created_at: string;
  updated_at: string;
  project: { id: string; name: string; color: string } | null;
}) {
  sessionTimeEntries.push(entry);
}

export function getSessionTimeEntries() {
  return sessionTimeEntries;
}

export function addSessionProject(project: {
  id: string;
  name: string;
  description?: string;
  color: string;
  parent_id: string | null;
  billable: boolean;
  hourly_rate: number | null;
  budget: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}) {
  sessionProjects.push(project);
}

export function getSessionProjects() {
  return sessionProjects;
}

export function getAllProjects() {
  return [...MOCK_PROJECTS, ...sessionProjects];
}
