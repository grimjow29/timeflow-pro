"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PresenceState {
  odeline: boolean;
  currentProjectId?: string;
  currentProjectName?: string;
  isTimerRunning: boolean;
  timerStartedAt?: string;
}

export interface UserPresence {
  odeline: boolean;
  currentProjectId?: string;
  currentProjectName?: string;
  isTimerRunning: boolean;
  timerStartedAt?: string;
  odeline_at: string;
}

export interface PresenceUser {
  odeline: boolean;
  currentProjectId?: string;
  currentProjectName?: string;
  isTimerRunning: boolean;
  timerStartedAt?: string;
  odeline_at: string;
  presence_ref: string;
}

export interface TeamMember {
  userId: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  presence: PresenceUser;
}

interface UsePresenceOptions {
  channelName?: string;
}

interface UsePresenceReturn {
  isOnline: boolean;
  teamMembers: TeamMember[];
  updatePresence: (state: Partial<PresenceState>) => void;
  error: Error | null;
}

export function usePresence(
  options: UsePresenceOptions = {}
): UsePresenceReturn {
  const { channelName = "presence:global" } = options;

  const [isOnline, setIsOnline] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceStateRef = useRef<PresenceState>({
    odeline: true,
    isTimerRunning: false,
  });

  // Get current user on mount
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      if (!supabase) return;

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          // User not authenticated - return empty state
          return;
        }

        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name,
            avatarUrl: user.user_metadata?.avatar_url,
          });
        }
      } catch {
        // Silently fail for unauthenticated users
        console.debug("Presence: User not authenticated");
      }
    };

    getUser();
  }, []);

  // Setup presence channel
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<
          UserPresence & {
            userId: string;
            email?: string;
            fullName?: string;
            avatarUrl?: string;
          }
        >();

        const members: TeamMember[] = [];

        Object.entries(presenceState).forEach(([userId, presences]) => {
          // Skip current user
          if (userId === currentUser.id) {
            return;
          }

          // Get the most recent presence for this user
          const latestPresence = presences[presences.length - 1];
          if (latestPresence) {
            members.push({
              userId,
              email: latestPresence.email,
              fullName: latestPresence.fullName,
              avatarUrl: latestPresence.avatarUrl,
              presence: {
                odeline: latestPresence.odeline,
                currentProjectId: latestPresence.currentProjectId,
                currentProjectName: latestPresence.currentProjectName,
                isTimerRunning: latestPresence.isTimerRunning,
                timerStartedAt: latestPresence.timerStartedAt,
                odeline_at: latestPresence.odeline_at,
                presence_ref: "",
              },
            });
          }
        });

        setTeamMembers(members);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.debug(`User ${key} joined`, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.debug(`User ${key} left`, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsOnline(true);
          setError(null);

          // Track initial presence
          await channel.track({
            odeline: true,
            isTimerRunning: presenceStateRef.current.isTimerRunning,
            currentProjectId: presenceStateRef.current.currentProjectId,
            currentProjectName: presenceStateRef.current.currentProjectName,
            timerStartedAt: presenceStateRef.current.timerStartedAt,
            odeline_at: new Date().toISOString(),
            userId: currentUser.id,
            email: currentUser.email,
            fullName: currentUser.fullName,
            avatarUrl: currentUser.avatarUrl,
          });
        } else if (status === "CHANNEL_ERROR") {
          setIsOnline(false);
          setError(new Error("Failed to connect to presence channel"));
        } else if (status === "TIMED_OUT") {
          setIsOnline(false);
          setError(new Error("Presence channel connection timed out"));
        }
      });

    // Cleanup on unmount
    return () => {
      setIsOnline(false);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [currentUser, channelName]);

  // Update presence state
  const updatePresence = useCallback(
    async (newState: Partial<PresenceState>) => {
      if (!channelRef.current || !currentUser) {
        return;
      }

      presenceStateRef.current = {
        ...presenceStateRef.current,
        ...newState,
      };

      try {
        await channelRef.current.track({
          ...presenceStateRef.current,
          odeline_at: new Date().toISOString(),
          userId: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.fullName,
          avatarUrl: currentUser.avatarUrl,
        });
      } catch (err) {
        console.error("Failed to update presence:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to update presence")
        );
      }
    },
    [currentUser]
  );

  return {
    isOnline,
    teamMembers,
    updatePresence,
    error,
  };
}
