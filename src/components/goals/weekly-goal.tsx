"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, TrendingDown, Minus, Flame, Edit3, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ProductivityScore,
  getMotivationalMessage,
  getStreakMessage,
} from "@/lib/ai/productivity-score";

interface WeeklyGoalProps {
  productivityScore: ProductivityScore;
  onGoalChange?: (newGoal: number) => void;
  className?: string;
}

export function WeeklyGoal({
  productivityScore,
  onGoalChange,
  className,
}: WeeklyGoalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(productivityScore.goalHours.toString());
  const [showCelebration, setShowCelebration] = useState(false);

  // Celebrate when goal is reached
  useEffect(() => {
    if (productivityScore.completionRate >= 100 && !showCelebration) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [productivityScore.completionRate, showCelebration]);

  const handleSaveGoal = () => {
    const newGoal = parseInt(editValue, 10);
    if (newGoal > 0 && newGoal <= 168) {
      onGoalChange?.(newGoal);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(productivityScore.goalHours.toString());
    setIsEditing(false);
  };

  const getTrendIcon = () => {
    switch (productivityScore.trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendText = () => {
    switch (productivityScore.trend) {
      case "up":
        return "En hausse";
      case "down":
        return "En baisse";
      default:
        return "Stable";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "B":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "C":
        return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "D":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      default:
        return "text-red-400 bg-red-500/20 border-red-500/30";
    }
  };

  const progressPercentage = Math.min(productivityScore.completionRate, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        "bg-gradient-to-br from-primary-500/10 via-surface to-surface",
        "border border-primary-500/20",
        "backdrop-blur-sm",
        showCelebration && "animate-pulse ring-2 ring-green-500/50",
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Target className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Objectif Hebdomadaire</h3>
            <p className="text-xs text-slate-500">Semaine en cours</p>
          </div>
        </div>
        <div
          className={cn(
            "px-2.5 py-1 rounded-md border text-sm font-bold",
            getGradeColor(productivityScore.grade)
          )}
        >
          {productivityScore.grade}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/5"
              />
              {/* Progress circle */}
              <circle
                cx="56"
                cy="56"
                r="45"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {Math.round(progressPercentage)}%
              </span>
              {showCelebration && (
                <span className="text-green-400 text-xs animate-bounce">
                  Objectif atteint!
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            {/* Hours */}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {productivityScore.weeklyHours}h
                </span>
                <span className="text-slate-500">/</span>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-12 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white text-sm focus:outline-none focus:border-primary-500"
                      min="1"
                      max="168"
                      autoFocus
                    />
                    <span className="text-slate-500 text-sm">h</span>
                    <button
                      onClick={handleSaveGoal}
                      className="p-1 hover:bg-green-500/20 rounded text-green-400"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors group"
                  >
                    <span className="text-lg">{productivityScore.goalHours}h</span>
                    <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {getMotivationalMessage(productivityScore)}
              </p>
            </div>

            {/* Trend & Streak */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {getTrendIcon()}
                <span className="text-xs text-slate-400">{getTrendText()}</span>
              </div>
              {productivityScore.streak > 0 && (
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-orange-400">
                    {productivityScore.streak} jours
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-5 py-3 bg-white/5 border-t border-white/5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
            Heures facturables
          </p>
          <p className="text-sm font-medium text-white">
            {productivityScore.billablePercentage}%
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
            Serie
          </p>
          <p className="text-sm font-medium text-white">
            {getStreakMessage(productivityScore.streak)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact version for dashboard
export function WeeklyGoalCompact({
  productivityScore,
  className,
}: {
  productivityScore: ProductivityScore;
  className?: string;
}) {
  const progressPercentage = Math.min(productivityScore.completionRate, 100);

  return (
    <div
      className={cn(
        "p-4 rounded-lg",
        "bg-gradient-to-r from-primary-500/10 to-transparent",
        "border border-primary-500/20",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-white">
            {productivityScore.weeklyHours}h / {productivityScore.goalHours}h
          </span>
        </div>
        <span
          className={cn(
            "text-xs font-bold px-1.5 py-0.5 rounded",
            productivityScore.grade === "A"
              ? "text-green-400 bg-green-500/20"
              : productivityScore.grade === "B"
                ? "text-blue-400 bg-blue-500/20"
                : "text-amber-400 bg-amber-500/20"
          )}
        >
          {productivityScore.grade}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            progressPercentage >= 100
              ? "bg-gradient-to-r from-green-500 to-green-400"
              : "bg-gradient-to-r from-primary-600 to-primary-400"
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <span>{Math.round(progressPercentage)}% complete</span>
        {productivityScore.streak > 0 && (
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3 h-3" />
            {productivityScore.streak}j
          </span>
        )}
      </div>
    </div>
  );
}
