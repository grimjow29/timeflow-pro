// Database types for TimeFlow Pro

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE" | "VALIDATOR";
export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type ApprovalStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  manager?: Profile;
  members?: Profile[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  parent_id: string | null;
  billable: boolean;
  hourly_rate: number | null;
  budget: number | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  // Relations
  parent?: Project;
  children?: Project[];
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  date: string;
  duration: number; // in minutes
  description: string | null;
  billable: boolean;
  timesheet_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  user?: Profile;
}

export interface TimesheetApproval {
  id: string;
  user_id: string;
  validator_id: string | null;
  week_start: string;
  week_end: string;
  total_hours: number;
  status: ApprovalStatus;
  comments: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  user?: Profile;
  validator?: Profile;
  entries?: TimeEntry[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Form types
export interface CreateTimeEntryInput {
  project_id: string;
  date: string;
  duration: number;
  description?: string;
  billable?: boolean;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  parent_id?: string;
  billable?: boolean;
  hourly_rate?: number;
  budget?: number;
}

export interface CreateGroupInput {
  name: string;
  manager_id?: string;
}
