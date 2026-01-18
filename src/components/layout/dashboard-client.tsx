"use client";

import { CommandPalette } from "@/components/ui/command-palette";

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommandPalette />
      {children}
    </>
  );
}
