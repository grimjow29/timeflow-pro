"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBypass, setShowBypass] = useState(false);
  const router = useRouter();

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (!supabase) {
        throw new Error("Service d'authentification non disponible");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "openid profile email",
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleBypass = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@timeflow.pro", password: "demo1234" }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative glass-panel p-10 rounded-2xl border border-white/10 shadow-glow flex flex-col items-center max-w-md w-full mx-4">
      {/* Logo */}
      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
        <Clock className="text-white w-6 h-6" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-medium tracking-tight text-white mb-2">
        TimeFlow Pro
      </h1>
      <p className="text-slate-400 mb-8 text-center font-light">
        Connectez-vous avec votre compte Microsoft
      </p>

      {/* Error message */}
      {error && (
        <div className="w-full mb-4 p-3 rounded-lg text-sm text-center bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Microsoft Login Button */}
      <button
        onClick={handleMicrosoftLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 px-6 py-3.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
          <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
        </svg>
        {isLoading ? "Connexion en cours..." : "Se connecter avec Microsoft"}
      </button>

      {/* Info */}
      <p className="mt-8 text-xs text-slate-500 text-center">
        Authentification sécurisée via Microsoft Azure AD
      </p>

      {/* Bypass discret */}
      {showBypass ? (
        <button
          onClick={handleBypass}
          disabled={isLoading}
          className="mt-2 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
        >
          Accès démo
        </button>
      ) : (
        <button
          onClick={() => setShowBypass(true)}
          className="mt-2 text-[10px] text-slate-700/50 hover:text-slate-600 transition-colors"
        >
          •••
        </button>
      )}
    </div>
  );
}
