'use client';

import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Toggle between dark and light (ignoring system for toggle)
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Current: ${theme === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun icon */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-yellow-400 transition-all duration-500 ease-in-out ${
            resolvedTheme === 'dark'
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>

        {/* Moon icon */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-violet-400 transition-all duration-500 ease-in-out ${
            resolvedTheme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* Subtle glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
          resolvedTheme === 'dark'
            ? 'bg-violet-500/10'
            : 'bg-yellow-500/10'
        }`}
      />
    </button>
  );
}
