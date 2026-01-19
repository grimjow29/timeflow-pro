import { getAuthUser } from "@/lib/auth-helper";
import { getMockTimeEntries } from "@/lib/mock-data";
import { Clock, Calendar, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get authenticated user (MODE DEMO)
  const { user } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch recent time entries (MODE DEMO: using mock data)
  const allEntries = getMockTimeEntries(user.id);
  const recentEntries = allEntries
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Calculate stats from mock data
  const totalMinutes = allEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = totalMinutes / 60;
  const weeklyHours = `${Math.floor(totalHours)}:${String(Math.round((totalHours % 1) * 60)).padStart(2, "0")}`;
  const monthlyHours = "142:30";
  const productivity = "94%";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">
            Dashboard
          </h2>
          <p className="text-slate-500 mt-1">
            Bienvenue {(user.user_metadata?.name as string | undefined) || user.email || "Utilisateur"}, voici votre activité.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">
            Hebdo
          </button>
          <button className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-md">
            Mensuel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Heures cette semaine"
          value={weeklyHours}
          icon={Clock}
          trend={{ value: "+12%", positive: true }}
          subtitle="vs semaine dernière"
        />
        <StatCard
          title="Heures ce mois"
          value={monthlyHours}
          icon={Calendar}
          progress={{ current: 142.5, max: 160 }}
        />
        <StatCard
          title="Productivité"
          value={productivity}
          icon={Zap}
          trend={{ value: "+3%", positive: true }}
          subtitle="Heures facturables"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  background: `conic-gradient(
                    #8b5cf6 0% 45%,
                    #a78bfa 45% 70%,
                    #4c1d95 70% 85%,
                    rgba(255,255,255,0.05) 85% 100%
                  )`,
                }}
              />
              <div className="absolute inset-4 bg-surface rounded-full flex flex-col items-center justify-center">
                <span className="text-3xl font-medium text-white">4</span>
                <span className="text-xs text-slate-500">Projets actifs</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-6 space-y-3">
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
                {recentEntries && recentEntries.length > 0 ? (
                  recentEntries.map((entry: {
                    id: string;
                    duration: number;
                    description: string | null;
                    project?: { name: string } | null;
                  }) => (
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
                        {Math.floor(entry.duration / 60)
                          .toString()
                          .padStart(2, "0")}
                        :{(entry.duration % 60).toString().padStart(2, "0")}
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
