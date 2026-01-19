"use client";

import { CommandPalette } from "@/components/ui/command-palette";
import { MobileMenuProvider } from "@/components/layout/mobile-menu-context";
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
      <MobileMenuProvider>
        <CommandPalette />
        {children}
      </MobileMenuProvider>
    </QueryClientProvider>
  );
}
