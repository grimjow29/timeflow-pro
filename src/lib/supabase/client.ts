"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Créer un client Supabase côté client
 * Mode DEMO: Retourne un client avec gestion d'erreur gracieuse si les clés sont invalides
 */
export function createClient(): SupabaseClient | null {
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

    return createBrowserClient(url, anonKey);
  } catch (error) {
    console.warn("[MODE DEMO] Erreur création client Supabase:", error);
    return null;
  }
}
