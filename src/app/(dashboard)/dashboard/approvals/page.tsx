"use client";

import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

// Mock data
const pendingApprovals = [
  {
    id: "1",
    user: {
      name: "John Doe",
      avatarSeed: "John",
    },
    period: "Semaine du 8 au 14 Janvier 2026",
    totalHours: "40:15",
    overtime: "+0:15",
    breakdown: [
      { project: "Client A", hours: "20h" },
      { project: "Client B", hours: "15h" },
      { project: "Interne", hours: "5h" },
    ],
  },
  {
    id: "2",
    user: {
      name: "Anna Smith",
      avatarSeed: "Anna",
    },
    period: "Semaine du 8 au 14 Janvier 2026",
    totalHours: "38:00",
    overtime: null,
    breakdown: [],
  },
];

export default function ApprovalsPage() {
  const handleApprove = (id: string) => {
    console.log("Approving:", id);
    // TODO: Implement approval logic
  };

  const handleReject = (id: string) => {
    console.log("Rejecting:", id);
    // TODO: Implement rejection logic
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-medium tracking-tight text-white mb-6">
        Validations en attente
      </h2>

      <div className="space-y-4">
        {pendingApprovals.map((approval, index) => (
          <GlassCard
            key={approval.id}
            className={`p-0 overflow-hidden border border-white/5 ${
              index > 0 ? "opacity-75 hover:opacity-100" : ""
            } transition-opacity`}
          >
            <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${approval.user.avatarSeed}&backgroundColor=ffdfbf`}
                  alt={approval.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {approval.user.name}
                  </h3>
                  <p className="text-xs text-slate-500">{approval.period}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 mr-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">
                    Total Heures
                  </div>
                  <div className="text-lg font-mono font-medium text-white">
                    {approval.totalHours}
                  </div>
                </div>
                {approval.overtime && (
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">
                      Heures Supp.
                    </div>
                    <div className="text-lg font-mono font-medium text-amber-400">
                      {approval.overtime}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button
                  onClick={() => handleReject(approval.id)}
                  className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 hover:text-red-400 transition-colors text-xs font-medium"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => handleApprove(approval.id)}
                  className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-colors text-xs font-medium"
                >
                  Approuver
                </button>
              </div>
            </div>

            {approval.breakdown.length > 0 && (
              <div className="bg-surfaceHighlight/30 px-6 py-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  {approval.breakdown.map((item, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400"
                    >
                      {item.project}: {item.hours}
                    </span>
                  ))}
                </div>
                <button className="text-xs text-primary-400 hover:text-white flex items-center gap-1 transition-colors">
                  Voir détails
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
