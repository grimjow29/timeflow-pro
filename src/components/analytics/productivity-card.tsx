"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductivityCardProps {
  totalHours: number;
  targetHours?: number; // Default 40h per week
  trend: number;
  avgHoursPerDay: number;
}

export function ProductivityCard({
  totalHours,
  targetHours = 40,
  trend,
  avgHoursPerDay,
}: ProductivityCardProps) {
  const productivityScore = Math.min(
    Math.round((totalHours / targetHours) * 100),
    100
  );

  const getTrendIcon = () => {
    if (trend > 0) {
      return <TrendingUp className="w-5 h-5 text-[#22c55e]" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-5 h-5 text-[#ef4444]" />;
    }
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return "text-[#22c55e]";
    if (trend < 0) return "text-[#ef4444]";
    return "text-slate-400";
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Productivite</h3>

      {/* Score Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#8b5cf6"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(productivityScore / 100) * 352} 352`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {productivityScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Total heures</span>
          <span className="text-white font-medium">{totalHours.toFixed(1)}h</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Objectif</span>
          <span className="text-white font-medium">{targetHours}h</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Moyenne/jour</span>
          <span className="text-white font-medium">{avgHoursPerDay.toFixed(1)}h</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="text-slate-400 text-sm">Tendance</span>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={cn("font-medium", getTrendColor())}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
