"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Zap, Loader2 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

interface TimeEntry {
  id: string;
  duration: number;
  description: string | null;
  date: string;
  project?: { name: string; color: string } | null;
}

interface DashboardStats {
  weeklyMinutes: number;
  monthlyMinutes: number;
  weeklyTrend: number;
  projectBreakdown: { name: string; color: string; percentage: number }[];
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    weeklyMinutes: 0,
    monthlyMinutes: 0,
    weeklyTrend: 12,
    projectBreakdown: [],
  });

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Charger les entrées de temps
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const response = await fetch(
          `/api/time-entries?week_start=${monthStart.toISOString().split("T")[0]}&week_end=${today.toISOString().split("T")[0]}`
        );
        const result = await response.json();

        if (response.ok && result.data) {
          const entries = result.data as TimeEntry[];

          // Trier et prendre les 5 dernières
          const sorted = entries.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setRecentEntries(sorted.slice(0, 5));

          // Calculer les stats
          const weeklyEntries = entries.filter((e) => {
            const entryDate = new Date(e.date);
            return entryDate >= weekStart;
          });

          const weeklyMinutes = weeklyEntries.reduce((sum, e) => sum + e.duration, 0);
          const monthlyMinutes = entries.reduce((sum, e) => sum + e.duration, 0);

          // Calculer la répartition par projet
          const projectTotals: Record<string, { name: string; color: string; minutes: number }> = {};
          entries.forEach((entry) => {
            const projectName = entry.project?.name || "Sans projet";
            const projectColor = entry.project?.color || "#8b5cf6";
            if (!projectTotals[projectName]) {
              projectTotals[projectName] = { name: projectName, color: projectColor, minutes: 0 };
            }
            projectTotals[projectName].minutes += entry.duration;
          });

          const totalMinutes = Object.values(projectTotals).reduce((sum, p) => sum + p.minutes, 0);
          const projectBreakdown = Object.values(projectTotals)
            .map((p) => ({
              name: p.name,
              color: p.color,
              percentage: totalMinutes > 0 ? Math.round((p.minutes / totalMinutes) * 100) : 0,
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 4);

          setStats({
            weeklyMinutes,
            monthlyMinutes,
            weeklyTrend: 12,
            projectBreakdown,
          });
        }
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
  };

  const displayStats = period === "weekly"
    ? { hours: formatHours(stats.weeklyMinutes), label: "cette semaine" }
    : { hours: formatHours(stats.monthlyMinutes), label: "ce mois" };

  const productivity = stats.weeklyMinutes > 0
    ? Math.min(100, Math.round((stats.weeklyMinutes / (40 * 60)) * 100))
    : 94;

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-medium tracking-tight text-white">
            Dashboard
          </h2>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">
            Bienvenue, voici votre activité.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("weekly")}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              period === "weekly"
                ? "bg-primary-600 text-white"
                : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            Hebdo
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              period === "monthly"
                ? "bg-primary-600 text-white"
                : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            Mensuel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title={`Heures ${displayStats.label}`}
          value={displayStats.hours}
          icon={Clock}
          trend={{ value: `+${stats.weeklyTrend}%`, positive: true }}
          subtitle="vs période précédente"
        />
        <StatCard
          title="Heures ce mois"
          value={formatHours(stats.monthlyMinutes)}
          icon={Calendar}
          progress={{ current: stats.monthlyMinutes / 60, max: 160 }}
        />
        <StatCard
          title="Productivité"
          value={`${productivity}%`}
          icon={Zap}
          trend={{ value: "+3%", positive: true }}
          subtitle="Heures facturables"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Chart Section */}
        <GlassCard className="p-6">
          <h4 className="text-base font-medium text-white mb-6">
            Répartition par Projet
          </h4>
          <div className="flex flex-col items-center justify-center">
            {/* Donut Chart */}
            <div className="relative w-48 h-48">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: stats.projectBreakdown.length > 0
                    ? `conic-gradient(${stats.projectBreakdown
                        .map((p, i) => {
                          const start = stats.projectBreakdown
                            .slice(0, i)
                            .reduce((sum, x) => sum + x.percentage, 0);
                          return `${p.color} ${start}% ${start + p.percentage}%`;
                        })
                        .join(", ")}, rgba(255,255,255,0.05) ${stats.projectBreakdown.reduce((sum, p) => sum + p.percentage, 0)}% 100%)`
                    : `conic-gradient(
                        #8b5cf6 0% 45%,
                        #a78bfa 45% 70%,
                        #4c1d95 70% 85%,
                        rgba(255,255,255,0.05) 85% 100%
                      )`,
                }}
              />
              <div className="absolute inset-4 bg-surface rounded-full flex flex-col items-center justify-center">
                <span className="text-3xl font-medium text-white">
                  {stats.projectBreakdown.length || 4}
                </span>
                <span className="text-xs text-slate-500">Projets actifs</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-6 space-y-3">
              {stats.projectBreakdown.length > 0 ? (
                stats.projectBreakdown.map((project, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                    <span className="text-slate-300">{project.percentage}%</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-primary-500 mr-2" />
                      Client A
                    </div>
                    <span className="text-slate-300">45%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-primary-400 mr-2" />
                      Client B
                    </div>
                    <span className="text-slate-300">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-primary-900 mr-2" />
                      Interne
                    </div>
                    <span className="text-slate-300">15%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Recent Entries */}
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h4 className="text-base font-medium text-white">
              Dernières entrées
            </h4>
            <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Voir tout
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-3 tracking-wider">Projet</th>
                  <th className="px-6 py-3 tracking-wider">Tâche</th>
                  <th className="px-6 py-3 tracking-wider">Durée</th>
                  <th className="px-6 py-3 tracking-wider text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {entry.project?.name || "Sans projet"}
                      </td>
                      <td className="px-6 py-4">
                        {entry.description || "Sans description"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {formatHours(entry.duration)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="success">Validé</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        Client ABC Corp
                      </td>
                      <td className="px-6 py-4">Design System UI</td>
                      <td className="px-6 py-4 font-mono text-xs">04:30</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="success">Validé</Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        App Mobile
                      </td>
                      <td className="px-6 py-4">Dev React Native</td>
                      <td className="px-6 py-4 font-mono text-xs">02:15</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="warning">En cours</Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        Interne
                      </td>
                      <td className="px-6 py-4">Weekly Meeting</td>
                      <td className="px-6 py-4 font-mono text-xs">01:00</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="success">Validé</Badge>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
