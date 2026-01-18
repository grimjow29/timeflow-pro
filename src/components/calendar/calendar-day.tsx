"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";

interface CalendarDayEntry {
  id: string;
  projectName: string;
  duration: number;
  color: string;
}

interface CalendarDayProps {
  date: Date;
  entries: CalendarDayEntry[];
  isToday?: boolean;
  isCurrentMonth?: boolean;
}

export function CalendarDay({
  date,
  entries,
  isToday = false,
  isCurrentMonth = true,
}: CalendarDayProps) {
  const dayNumber = date.getDate();
  const totalDuration = entries.reduce((acc, entry) => acc + entry.duration, 0);

  return (
    <div
      className={cn(
        "min-h-[100px] p-2 border border-white/5 rounded-lg transition-colors",
        isCurrentMonth
          ? "bg-surface hover:bg-surfaceHighlight/50"
          : "bg-surface/30 opacity-50",
        isToday && "ring-2 ring-primary-500"
      )}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "text-sm font-medium",
            isToday ? "text-primary-400" : isCurrentMonth ? "text-white" : "text-slate-500"
          )}
        >
          {dayNumber}
        </span>
        {totalDuration > 0 && (
          <span className="text-[10px] text-slate-400 font-mono">
            {formatDuration(totalDuration)}
          </span>
        )}
      </div>

      {/* Entries */}
      <div className="space-y-1">
        {entries.slice(0, 3).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-1.5 text-[10px] rounded px-1.5 py-0.5 truncate"
            style={{
              backgroundColor: `${entry.color}15`,
              color: entry.color,
            }}
            title={`${entry.projectName} - ${formatDuration(entry.duration)}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate">{entry.projectName}</span>
          </div>
        ))}
        {entries.length > 3 && (
          <div className="text-[10px] text-slate-500 pl-1">
            +{entries.length - 3} autres
          </div>
        )}
      </div>
    </div>
  );
}
