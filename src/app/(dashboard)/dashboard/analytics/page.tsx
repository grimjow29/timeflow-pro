"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { TimeChart } from "@/components/analytics/time-chart";
import { ProjectPieChart } from "@/components/analytics/project-pie-chart";
import { ProductivityCard } from "@/components/analytics/productivity-card";
import { BarChart3, Loader2 } from "lucide-react";

type Period = "week" | "month";

interface HoursPerDay {
  date: string;
  hours: number;
}

interface HoursPerProject {
  project: string;
  hours: number;
  color: string;
}

interface AnalyticsData {
  hoursPerDay: HoursPerDay[];
  hoursPerProject: HoursPerProject[];
  totalHours: number;
  avgHoursPerDay: number;
  trend: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics?period=${period}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erreur lors du chargement");
        }

        setData(result.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [period]);

  const targetHours = period === "week" ? 40 : 160;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#8b5cf6]/20">
            <BarChart3 className="w-6 h-6 text-[#8b5cf6]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === "week"
                ? "bg-[#8b5cf6] text-white"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === "month"
                ? "bg-[#8b5cf6] text-white"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <GlassCard className="p-6">
          <p className="text-[#ef4444] text-center">{error}</p>
        </GlassCard>
      )}

      {/* Data Display */}
      {data && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Chart - takes 2 columns */}
          <GlassCard className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Heures par jour
            </h2>
            <TimeChart data={data.hoursPerDay} />
          </GlassCard>

          {/* Productivity Card - takes 1 column */}
          <ProductivityCard
            totalHours={data.totalHours}
            targetHours={targetHours}
            trend={data.trend}
            avgHoursPerDay={data.avgHoursPerDay}
          />

          {/* Project Pie Chart */}
          <GlassCard className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Repartition par projet
            </h2>
            <ProjectPieChart data={data.hoursPerProject} />
          </GlassCard>

          {/* Quick Stats */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Resume</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-slate-400 text-sm">Projets actifs</p>
                <p className="text-2xl font-bold text-white">
                  {data.hoursPerProject.length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-slate-400 text-sm">Jours travailles</p>
                <p className="text-2xl font-bold text-white">
                  {data.hoursPerDay.filter((d) => d.hours > 0).length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-slate-400 text-sm">Meilleur jour</p>
                <p className="text-2xl font-bold text-white">
                  {data.hoursPerDay.length > 0
                    ? `${Math.max(...data.hoursPerDay.map((d) => d.hours)).toFixed(1)}h`
                    : "0h"}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
