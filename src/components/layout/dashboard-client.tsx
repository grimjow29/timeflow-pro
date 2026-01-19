"use client";

import { CommandPalette } from "@/components/ui/command-palette";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function DashboardClient({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CommandPalette />
      {children}
    </QueryClientProvider>
  );
}
