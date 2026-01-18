"use client";

import { Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

// Mock data
const teamMembers = [
  {
    id: "1",
    name: "Michel Dubaï",
    email: "michel@timeflow.com",
    role: "Admin",
    group: "Tech",
    avatarSeed: "Michel",
    isOnline: true,
  },
  {
    id: "2",
    name: "Sarah Connor",
    email: "sarah@timeflow.com",
    role: "Employee",
    group: "Design",
    avatarSeed: "Sarah",
    isOnline: true,
  },
];

export default function TeamPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Équipe
        </h2>
        <button className="bg-surfaceHighlight hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Créer un groupe
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Cards */}
        {teamMembers.map((member) => (
          <GlassCard
            key={member.id}
            className="p-6 flex flex-col items-center text-center border border-white/5 hover:border-primary-500/30 transition-all group"
          >
            <div className="relative mb-4">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatarSeed}&backgroundColor=b6e3f4`}
                alt={member.name}
                className="w-20 h-20 rounded-full ring-4 ring-surfaceHighlight group-hover:ring-primary-500/30 transition-all"
              />
              {member.isOnline && (
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-surfaceHighlight rounded-full" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white">{member.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{member.email}</p>

            <div className="flex gap-2 w-full mt-auto">
              <div className="flex-1 bg-white/5 rounded py-2">
                <div className="text-[10px] text-slate-500 uppercase">Rôle</div>
                <div
                  className={`text-xs font-medium ${
                    member.role === "Admin" ? "text-primary-400" : "text-slate-300"
                  }`}
                >
                  {member.role}
                </div>
              </div>
              <div className="flex-1 bg-white/5 rounded py-2">
                <div className="text-[10px] text-slate-500 uppercase">
                  Groupe
                </div>
                <div className="text-xs font-medium text-white">
                  {member.group}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {/* Add User Card */}
        <div className="border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center p-6 hover:bg-white/5 transition-colors cursor-pointer min-h-[260px]">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-400">
            Inviter un membre
          </span>
        </div>
      </div>
    </div>
  );
}
