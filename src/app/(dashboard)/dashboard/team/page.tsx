"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Profile, Group, UserRole } from "@/lib/types";

interface ProfileWithGroup extends Profile {
  group: { id: string; name: string } | null;
}

export default function TeamPage() {
  const [members, setMembers] = useState<ProfileWithGroup[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Filter state
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [usersRes, groupsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/groups"),
        ]);

        if (!usersRes.ok || !groupsRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const usersData = await usersRes.json();
        const groupsData = await groupsRes.json();

        setMembers(usersData.data || []);
        setGroups(groupsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Create group
  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setCreatingGroup(true);
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      const { data } = await res.json();
      setGroups((prev) => [...prev, data]);
      setNewGroupName("");
      setShowGroupModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création");
    } finally {
      setCreatingGroup(false);
    }
  }

  // Filter members by group
  const filteredMembers = selectedGroup
    ? members.filter((m) => m.group_id === selectedGroup)
    : members;

  // Role display
  const getRoleStyle = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "text-primary-400";
      case "MANAGER":
        return "text-amber-400";
      case "VALIDATOR":
        return "text-emerald-400";
      default:
        return "text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Équipe
        </h2>
        <button
          onClick={() => setShowGroupModal(true)}
          className="bg-surfaceHighlight hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Créer un groupe
        </button>
      </div>

      {/* Group Filter */}
      {groups.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedGroup === null
                ? "bg-primary-500 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            Tous
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedGroup === group.id
                  ? "bg-primary-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>
      )}

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Cards */}
        {filteredMembers.map((member) => (
          <GlassCard
            key={member.id}
            className="p-6 flex flex-col items-center text-center border border-white/5 hover:border-primary-500/30 transition-all group"
          >
            <div className="relative mb-4">
              <img
                src={
                  member.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name || member.email}&backgroundColor=b6e3f4`
                }
                alt={member.name || "Utilisateur"}
                className="w-20 h-20 rounded-full ring-4 ring-surfaceHighlight group-hover:ring-primary-500/30 transition-all"
              />
            </div>
            <h3 className="text-lg font-medium text-white">
              {member.name || "Sans nom"}
            </h3>
            <p className="text-sm text-slate-400 mb-4">{member.email}</p>

            <div className="flex gap-2 w-full mt-auto">
              <div className="flex-1 bg-white/5 rounded py-2">
                <div className="text-[10px] text-slate-500 uppercase">Rôle</div>
                <div className={`text-xs font-medium ${getRoleStyle(member.role)}`}>
                  {member.role}
                </div>
              </div>
              <div className="flex-1 bg-white/5 rounded py-2">
                <div className="text-[10px] text-slate-500 uppercase">Groupe</div>
                <div className="text-xs font-medium text-white">
                  {member.group?.name || "—"}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {/* Empty state */}
        {filteredMembers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">Aucun membre trouvé</p>
          </div>
        )}

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

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Créer un groupe</h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">
                  Nom du groupe
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Design, Tech, Marketing..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup || !newGroupName.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creatingGroup && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
