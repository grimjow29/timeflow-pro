"use client";

// Supabase gère l'auth via cookies, pas besoin de context provider
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
