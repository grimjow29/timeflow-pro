"use client";

import { useQuery } from "@tanstack/react-query";
import { TimeEntry, Project } from "@/lib/types";

interface FetchTimeEntriesParams {
  week_start?: string;
  week_end?: string;
  project_id?: string;
}

export function useTimeEntries(params?: FetchTimeEntriesParams) {
  return useQuery({
    queryKey: ["time-entries", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.week_start) searchParams.set("week_start", params.week_start);
      if (params?.week_end) searchParams.set("week_end", params.week_end);
      if (params?.project_id) searchParams.set("project_id", params.project_id);

      const response = await fetch(`/api/time-entries?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch time entries");
      }
      const data = await response.json();
      return data.data as TimeEntry[];
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      return data.data as Project[];
    },
  });
}
