"use client";

import { useState } from "react";
import { Lightbulb, Sparkles, Clock, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeSuggestion } from "@/lib/ai/time-suggestions";

interface SmartSuggestionsProps {
  suggestions: TimeSuggestion[];
  onApply?: (suggestion: TimeSuggestion) => void;
  onDismiss?: (suggestion: TimeSuggestion) => void;
  className?: string;
}

export function SmartSuggestions({
  suggestions,
  onApply,
  onDismiss,
  className,
}: SmartSuggestionsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleSuggestions = suggestions.filter(
    (s) => !dismissedIds.has(s.projectId)
  );

  const handleDismiss = (suggestion: TimeSuggestion) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(suggestion.projectId);
      return newSet;
    });
    onDismiss?.(suggestion);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.7) return "text-green-400";
    if (confidence >= 0.4) return "text-amber-400";
    return "text-slate-400";
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.7) return "Tres probable";
    if (confidence >= 0.4) return "Probable";
    return "Suggestion";
  };

  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        "bg-gradient-to-br from-amber-500/10 via-surface to-surface",
        "border border-amber-500/20",
        "backdrop-blur-sm",
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            Suggestions AI
            <span className="text-[10px] font-normal text-amber-400/80 uppercase tracking-wider">
              Beta
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Basees sur vos habitudes de travail
          </p>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="divide-y divide-white/5">
        {visibleSuggestions.map((suggestion) => (
          <div
            key={suggestion.projectId}
            className="px-5 py-4 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Suggestion Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white truncate">
                    {suggestion.projectName}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider",
                      getConfidenceColor(suggestion.confidence)
                    )}
                  >
                    {getConfidenceLabel(suggestion.confidence)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{suggestion.reason}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Duree suggeree: </span>
                  <span className="text-amber-400 font-medium">
                    {formatDuration(suggestion.suggestedDuration)}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDismiss(suggestion)}
                  className="p-1.5 rounded-md hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                  title="Ignorer"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onApply?.(suggestion)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                    "bg-amber-500/20 text-amber-400",
                    "hover:bg-amber-500/30 transition-colors"
                  )}
                >
                  Appliquer
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  suggestion.confidence >= 0.7
                    ? "bg-green-500"
                    : suggestion.confidence >= 0.4
                      ? "bg-amber-500"
                      : "bg-slate-500"
                )}
                style={{ width: `${suggestion.confidence * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-white/5 border-t border-white/5">
        <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3" />
          Les suggestions s&apos;ameliorent avec l&apos;utilisation
        </p>
      </div>
    </div>
  );
}

// Mini variant for sidebar or compact views
export function SmartSuggestionsMini({
  suggestion,
  onApply,
  className,
}: {
  suggestion: TimeSuggestion;
  onApply?: (suggestion: TimeSuggestion) => void;
  className?: string;
}) {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}`;
  };

  return (
    <button
      onClick={() => onApply?.(suggestion)}
      className={cn(
        "w-full p-3 rounded-lg text-left",
        "bg-amber-500/10 border border-amber-500/20",
        "hover:bg-amber-500/20 transition-colors",
        "group",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span className="text-xs font-medium text-amber-400">
          Suggestion rapide
        </span>
      </div>
      <p className="text-sm text-white truncate">{suggestion.projectName}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {formatDuration(suggestion.suggestedDuration)} - Cliquez pour appliquer
      </p>
    </button>
  );
}
