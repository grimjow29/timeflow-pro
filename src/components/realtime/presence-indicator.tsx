"use client";

import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function PresenceIndicator({
  isOnline,
  size = "sm",
  className,
}: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3.5 w-3.5",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full",
        sizeClasses[size],
        isOnline ? "bg-[#22c55e]" : "bg-[#6b7280]",
        isOnline && "animate-pulse",
        className
      )}
      role="status"
      aria-label={isOnline ? "Online" : "Offline"}
    />
  );
}
