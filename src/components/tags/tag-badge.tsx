"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function TagBadge({ name, color, onRemove, size = "md" }: TagBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span className="truncate max-w-[100px]">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 transition-opacity rounded-full p-0.5"
          style={{ backgroundColor: `${color}30` }}
          aria-label={`Supprimer le tag ${name}`}
        >
          <X className={cn(size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")} />
        </button>
      )}
    </span>
  );
}
