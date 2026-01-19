'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const THEME_KEY = 'timeflow-theme';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return 'dark';
}

function applyTheme(resolvedTheme: 'dark' | 'light') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(resolvedTheme);

  // Also update body background for immediate visual feedback
  if (resolvedTheme === 'light') {
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#1e293b';
  } else {
    document.body.style.backgroundColor = '#0f0a1a';
    document.body.style.color = '#e2e8f0';
  }

  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f0a1a' : '#f8fafc');
  }
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    const resolved = storedTheme === 'system' ? getSystemTheme() : storedTheme;

    setThemeState(storedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);

    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}
