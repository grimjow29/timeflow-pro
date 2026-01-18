import { LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  progress?: {
    current: number;
    max: number;
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  progress,
}: StatCardProps) {
  return (
    <GlassCard className="p-5 relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-16 h-16 text-primary-500" />
      </div>

      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
        {title}
      </p>
      <h3 className="text-3xl font-medium text-white tracking-tight">{value}</h3>

      <div className="flex items-center mt-3 text-xs">
        {trend && (
          <span
            className={cn(
              "flex items-center px-1.5 py-0.5 rounded mr-2",
              trend.positive
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-red-400 bg-red-400/10"
            )}
          >
            {trend.value}
          </span>
        )}
        {subtitle && <span className="text-slate-500">{subtitle}</span>}
        {progress && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400">
              Objectif: <span className="text-slate-200">{progress.max}h</span>
            </span>
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500"
                style={{
                  width: `${Math.min((progress.current / progress.max) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
