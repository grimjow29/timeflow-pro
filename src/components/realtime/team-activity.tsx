"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { PresenceIndicator } from "./presence-indicator";
import { usePresence, type TeamMember } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

interface TeamActivityProps {
  className?: string;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "??";
}

function formatDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

interface MemberCardProps {
  member: TeamMember;
}

function MemberCard({ member }: MemberCardProps) {
  const [duration, setDuration] = useState<string>("");

  // Update duration every second if timer is running
  useEffect(() => {
    if (!member.presence.isTimerRunning || !member.presence.timerStartedAt) {
      setDuration("");
      return;
    }

    // Initial calculation
    setDuration(formatDuration(member.presence.timerStartedAt));

    // Update every second
    const interval = setInterval(() => {
      if (member.presence.timerStartedAt) {
        setDuration(formatDuration(member.presence.timerStartedAt));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [member.presence.isTimerRunning, member.presence.timerStartedAt]);

  const displayName = member.fullName || member.email?.split("@")[0] || "User";
  const initials = getInitials(member.fullName, member.email);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#251838]/50 hover:bg-[#251838] transition-colors">
      {/* Avatar with presence indicator */}
      <div className="relative">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#8b5cf6]/30"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center ring-2 ring-[#8b5cf6]/30">
            <span className="text-sm font-medium text-[#8b5cf6]">
              {initials}
            </span>
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5">
          <PresenceIndicator isOnline={member.presence.odeline} size="sm" />
        </div>
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{displayName}</p>

        {member.presence.isTimerRunning && member.presence.currentProjectName ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b5cf6] truncate">
              {member.presence.currentProjectName}
            </span>
            {duration && (
              <span className="text-xs text-[#6b7280] font-mono">
                {duration}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#6b7280]">Idle</p>
        )}
      </div>

      {/* Timer indicator */}
      {member.presence.isTimerRunning && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
        </div>
      )}
    </div>
  );
}

export function TeamActivity({ className }: TeamActivityProps) {
  const { teamMembers, isOnline, error } = usePresence();

  const onlineMembers = teamMembers.filter((m) => m.presence.odeline);
  const activeMembers = teamMembers.filter((m) => m.presence.isTimerRunning);

  return (
    <GlassCard className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Team Activity</h3>
          <PresenceIndicator isOnline={isOnline} size="sm" />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#6b7280]">
            <span className="text-[#22c55e] font-medium">
              {onlineMembers.length}
            </span>{" "}
            online
          </span>
          <span className="text-[#6b7280]">
            <span className="text-[#8b5cf6] font-medium">
              {activeMembers.length}
            </span>{" "}
            active
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 rounded-lg p-2 mb-3">
          {error.message}
        </div>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[#6b7280]">No team members online</p>
            <p className="text-xs text-[#6b7280]/60 mt-1">
              Team members will appear here when they come online
            </p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <MemberCard key={member.userId} member={member} />
          ))
        )}
      </div>
    </GlassCard>
  );
}
