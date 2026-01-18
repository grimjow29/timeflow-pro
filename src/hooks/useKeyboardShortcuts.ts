"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// Custom event types for timer actions
export const TIMER_EVENTS = {
  TOGGLE: "timer:toggle",
  START: "timer:start",
  STOP: "timer:stop",
} as const;

// Custom event types for command palette
export const COMMAND_PALETTE_EVENTS = {
  TOGGLE: "commandPalette:toggle",
  OPEN: "commandPalette:open",
  CLOSE: "commandPalette:close",
} as const;

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true } = options;
  const router = useRouter();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Get modifier key (Cmd on Mac, Ctrl on Windows/Linux)
      const isMod = event.metaKey || event.ctrlKey;

      if (!isMod) return;

      switch (event.key.toLowerCase()) {
        // Cmd/Ctrl+K: Toggle command palette
        case "k":
          event.preventDefault();
          window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENTS.TOGGLE));
          break;

        // Cmd/Ctrl+T: Toggle timer (only if not typing)
        case "t":
          if (!isTyping) {
            event.preventDefault();
            window.dispatchEvent(new CustomEvent(TIMER_EVENTS.TOGGLE));
          }
          break;

        // Cmd/Ctrl+N: New time entry (only if not typing)
        case "n":
          if (!isTyping) {
            event.preventDefault();
            router.push("/dashboard/timesheet?action=new");
          }
          break;
      }
    },
    [router]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Return helper functions for programmatic control
  return {
    toggleCommandPalette: () => {
      window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENTS.TOGGLE));
    },
    openCommandPalette: () => {
      window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENTS.OPEN));
    },
    closeCommandPalette: () => {
      window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENTS.CLOSE));
    },
    toggleTimer: () => {
      window.dispatchEvent(new CustomEvent(TIMER_EVENTS.TOGGLE));
    },
    startTimer: () => {
      window.dispatchEvent(new CustomEvent(TIMER_EVENTS.START));
    },
    stopTimer: () => {
      window.dispatchEvent(new CustomEvent(TIMER_EVENTS.STOP));
    },
  };
}

// Hook to listen for timer events
export function useTimerEvents(handlers: {
  onToggle?: () => void;
  onStart?: () => void;
  onStop?: () => void;
}) {
  useEffect(() => {
    const handleToggle = () => handlers.onToggle?.();
    const handleStart = () => handlers.onStart?.();
    const handleStop = () => handlers.onStop?.();

    window.addEventListener(TIMER_EVENTS.TOGGLE, handleToggle);
    window.addEventListener(TIMER_EVENTS.START, handleStart);
    window.addEventListener(TIMER_EVENTS.STOP, handleStop);

    return () => {
      window.removeEventListener(TIMER_EVENTS.TOGGLE, handleToggle);
      window.removeEventListener(TIMER_EVENTS.START, handleStart);
      window.removeEventListener(TIMER_EVENTS.STOP, handleStop);
    };
  }, [handlers]);
}
