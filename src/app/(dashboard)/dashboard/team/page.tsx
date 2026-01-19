"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Users, Mail, UserCircle, Shield, Edit2, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Profile, Group, UserRole } from "@/lib/types";

interface ProfileWithGroup extends Profile {
  group: { id: string; name: string } | null;
}

interface MemberFormData {
  email: string;
  name: string;
  role: UserRole;
  group_id: string | null;
}

export default function TeamPage() {
  const [members, setMembers] = useState<ProfileWithGroup[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);

  // Member form
  const [memberForm, setMemberForm] = useState<MemberFormData>({
    email: "",
    name: "",
    role: "EMPLOYEE",
    group_id: null,
  });

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

  // Create member
  async function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    if (!memberForm.email || !memberForm.name) {
      setError("Email et nom sont requis");
      return;
    }

    try {
      setCreatingMember(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      const { data } = await res.json();

      // Add group info if needed
      const groupInfo = memberForm.group_id
        ? groups.find(g => g.id === memberForm.group_id)
        : null;

      const newMember = {
        ...data,
        group: groupInfo ? { id: groupInfo.id, name: groupInfo.name } : null,
      };

      setMembers((prev) => [...prev, newMember]);

      // Reset form
      setMemberForm({
        email: "",
        name: "",
        role: "EMPLOYEE",
        group_id: null,
      });
      setShowMemberModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création");
    } finally {
      setCreatingMember(false);
    }
  }

  // Filter members by group
  const filteredMembers = selectedGroup
    ? members.filter((m) => m.group_id === selectedGroup)
    : members;

  // Role badge variant
  const getRoleBadgeVariant = (role: UserRole): "success" | "warning" | "error" | "info" | "default" => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "MANAGER":
        return "warning";
      case "VALIDATOR":
        return "success";
      default:
        return "info";
    }
  };

  // Role display color
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
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">
            Équipe
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {members.length} membre{members.length > 1 ? "s" : ""} dans l&apos;organisation
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Créer un groupe
          </button>
          <button
            onClick={() => setShowMemberModal(true)}
            className="bg-primary-500 hover:bg-primary-600 border border-primary-400/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un membre
          </button>
        </div>
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
            Tous ({members.length})
          </button>
          {groups.map((group) => {
            const count = members.filter(m => m.group_id === group.id).length;
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedGroup === group.id
                    ? "bg-primary-500 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {group.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Cards */}
        {filteredMembers.map((member) => (
          <GlassCard
            key={member.id}
            className="p-6 flex flex-col border border-white/5 hover:border-primary-500/30 transition-all group relative"
          >
            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="relative mb-3">
                <img
                  src={
                    member.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name || member.email}&backgroundColor=b6e3f4`
                  }
                  alt={member.name || "Utilisateur"}
                  className="w-20 h-20 rounded-full ring-4 ring-surfaceHighlight group-hover:ring-primary-500/30 transition-all"
                />
                <Badge
                  variant={getRoleBadgeVariant(member.role)}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] px-2"
                >
                  {member.role}
                </Badge>
              </div>

              <h3 className="text-lg font-medium text-white">
                {member.name || "Sans nom"}
              </h3>
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {member.email}
              </p>
            </div>

            {/* Info Cards */}
            <div className="flex gap-2 w-full mt-auto">
              <div className="flex-1 bg-white/5 rounded-lg py-2.5 px-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Rôle
                </div>
                <div className={`text-xs font-medium ${getRoleStyle(member.role)}`}>
                  {member.role}
                </div>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg py-2.5 px-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Groupe
                </div>
                <div className="text-xs font-medium text-white truncate">
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
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Créer un groupe</h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup || !newGroupName.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creatingGroup && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium text-white">Ajouter un membre</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="exemple@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  required
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  <UserCircle className="w-3.5 h-3.5 inline mr-1" />
                  Nom *
                </label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Prénom Nom"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  <Shield className="w-3.5 h-3.5 inline mr-1" />
                  Rôle *
                </label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="VALIDATOR">VALIDATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Groupe
                </label>
                <select
                  value={memberForm.group_id || ""}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, group_id: e.target.value || null }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">Aucun groupe</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingMember}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creatingMember && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
