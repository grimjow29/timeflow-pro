"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock } from "lucide-react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "email profile openid",
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
    } catch {
      setError("Une erreur est survenue");
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
        Advanced time tracking for the modern era.
      </p>

      {/* Error message */}
      {error && (
        <div className="w-full mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Microsoft Login Button */}
      <button
        onClick={handleMicrosoftLogin}
        disabled={isLoading}
        className="w-full group relative flex items-center justify-center gap-3 bg-surfaceHighlight hover:bg-surface border border-white/10 hover:border-primary-500/50 text-white px-6 py-3.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />

        {/* Microsoft Logo */}
        <svg className="w-5 h-5" viewBox="0 0 23 23">
          <path fill="#f35022" d="M1 1h10v10H1z" />
          <path fill="#80bb03" d="M12 1h10v10H12z" />
          <path fill="#03a5f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>

        <span className="font-medium relative z-10">
          {isLoading ? "Connexion en cours..." : "Se connecter avec Microsoft"}
        </span>
      </button>

      {/* Terms */}
      <p className="mt-8 text-xs text-slate-500 text-center">
        En continuant, vous acceptez nos{" "}
        <span className="text-slate-400 hover:text-primary-400 cursor-pointer">
          Conditions d&apos;utilisation
        </span>
        .
      </p>
    </div>
  );
}
