import { createClient } from "@/lib/supabase/server";

// BYPASS AUTH FOR TESTING
const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

// Mock user for testing
const MOCK_USER = {
  id: "mock-user-id",
  email: "test@timeflow.pro",
  app_metadata: {},
  user_metadata: { name: "Test User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export type AuthUser = {
  id: string;
  email?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
  created_at: string;
};

/**
 * Get authenticated user - returns mock user if BYPASS_AUTH is enabled
 */
export async function getAuthUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
  if (BYPASS_AUTH) {
    return { user: MOCK_USER as AuthUser, error: null };
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  return { user: user as AuthUser | null, error };
}

/**
 * Get Supabase client - for database operations
 */
export async function getSupabaseClient() {
  return await createClient();
}
