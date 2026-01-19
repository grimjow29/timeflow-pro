import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Créer un client Supabase côté serveur
 * Mode DEMO: Retourne null si les clés sont invalides
 */
export async function createClient(): Promise<SupabaseClient<Database> | null> {
  const cookieStore = await cookies();

  try {
    // Vérifier que les variables d'environnement existent
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey || url === "" || anonKey === "") {
      console.warn("[MODE DEMO] Clés Supabase manquantes - Utilisation des données mock");
      return null;
    }

    // Validation basique du format de la clé
    if (!anonKey.startsWith("eyJ")) {
      console.warn("[MODE DEMO] Clé Supabase invalide - Utilisation des données mock");
      return null;
    }

    return createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });
  } catch (error) {
    console.warn("[MODE DEMO] Erreur création client Supabase:", error);
    return null;
  }
}
