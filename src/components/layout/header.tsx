"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Play, Pause, Square } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  user: Profile | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Header({ user }: HeaderProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentProject, setCurrentProject] = useState("Aucun projet");

  // Load timer state from localStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem("timeflow-timer");
    if (savedTimer) {
      const { isRunning: savedRunning, startTime, project } = JSON.parse(savedTimer);
      if (savedRunning && startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(elapsed);
        setIsRunning(true);
      }
      if (project) setCurrentProject(project);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Save timer state to localStorage
  useEffect(() => {
    if (isRunning) {
      localStorage.setItem(
        "timeflow-timer",
        JSON.stringify({
          isRunning: true,
          startTime: Date.now() - seconds * 1000,
          project: currentProject,
        })
      );
    }
  }, [isRunning, seconds, currentProject]);

  const handleToggleTimer = () => {
    if (isRunning) {
      // Stopping timer
      setIsRunning(false);
      localStorage.removeItem("timeflow-timer");
    } else {
      // Starting timer
      setIsRunning(true);
      setSeconds(0);
    }
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    localStorage.removeItem("timeflow-timer");
    // TODO: Save time entry to database
  };

  return (
    <header className="h-16 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-10 sticky top-0">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher (Cmd+K)"
            className="w-full bg-surfaceHighlight/50 border border-white/5 rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        {/* Timer Widget */}
        <div className="flex items-center gap-3 bg-surfaceHighlight border border-white/10 rounded-full pl-4 pr-1.5 py-1.5 shadow-lg shadow-black/20">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">
              {isRunning ? currentProject : "Timer"}
            </span>
            <span
              className={`font-mono font-medium tracking-wide leading-none mt-1 ${
                isRunning ? "text-primary-400" : "text-slate-400"
              }`}
            >
              {formatTime(seconds)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleTimer}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                isRunning
                  ? "bg-primary-600 hover:bg-primary-500"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {isRunning ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
              )}
            </button>

            {isRunning && (
              <button
                onClick={handleStopTimer}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface" />
        </button>
      </div>
    </header>
  );
}
