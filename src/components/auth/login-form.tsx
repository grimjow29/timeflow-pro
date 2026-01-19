"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Identifiants incorrects");

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email professionnel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={1}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
        </div>

        <button
          type="submit"
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
      </form>

      {/* Info */}
      <p className="mt-8 text-xs text-slate-500 text-center">
        Authentification sécurisée via Microsoft Azure AD
      </p>
    </div>
  );
}
