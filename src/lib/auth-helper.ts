import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type AuthUser = {
  id: string;
  email?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
  created_at: string;
};

/**
 * Check for active session
 */
async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tf_session");
    if (!sessionCookie?.value) return null;

    const session = JSON.parse(sessionCookie.value);
    if (session.expires && session.expires > Date.now()) {
      return {
        id: session.user.id,
        email: session.user.email,
        app_metadata: {},
        user_metadata: { name: session.user.name },
        aud: "authenticated",
        created_at: session.user.created_at,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Get authenticated user
 */
export async function getAuthUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
  // Check session first (MODE DEMO)
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    return { user: sessionUser, error: null };
  }

  // Fallback to Supabase (si disponible)
  try {
    const supabase = await createClient();

    // En mode DEMO, si Supabase n'est pas disponible, retourner null
    if (!supabase) {
      return { user: null, error: new Error("No active session") };
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    return { user: user as AuthUser | null, error };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

/**
 * Get Supabase client - for database operations
 * MODE DEMO: Retourne null si Supabase n'est pas configuré
 */
export async function getSupabaseClient() {
  try {
    return await createClient();
  } catch (error) {
    console.warn("[MODE DEMO] Supabase non disponible:", error);
    return null;
  }
}
