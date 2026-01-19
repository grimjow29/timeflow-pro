"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, RefreshCw, X, Clock, Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { TimesheetApproval } from "@/lib/types";

interface ApprovalWithDetails extends TimesheetApproval {
  totalHours: string;
  breakdown: Array<{
    project: string;
    color: string;
    hours: string;
  }>;
}

// Event pour notifier le sidebar
const notifySidebarRefresh = () => {
  window.dispatchEvent(new CustomEvent('approvals-updated'));
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalWithDetails | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Filtrer par status=PENDING pour n'afficher que les approbations en attente
      const response = await fetch("/api/approvals?status=PENDING");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors du chargement");
      }

      setApprovals(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/approvals/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'approbation");
      }

      // Retirer l'approbation de la liste
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      // Notifier le sidebar pour mettre à jour le badge
      notifySidebarRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'approbation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Raison du rejet (optionnel):");

    setProcessingId(id);
    try {
      const response = await fetch(`/api/approvals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors du rejet");
      }

      // Retirer l'approbation de la liste
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      // Notifier le sidebar pour mettre à jour le badge
      notifySidebarRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const formatPeriod = (weekStart: string, weekEnd: string) => {
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return `Semaine du ${start.toLocaleDateString("fr-FR", { day: "numeric" })} au ${end.toLocaleDateString("fr-FR", options)}`;
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchApprovals}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm"
          >
            Réessayer
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Validations en attente
        </h2>
        <button
          onClick={fetchApprovals}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {approvals.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-slate-400">Aucune validation en attente</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval, index) => (
            <GlassCard
              key={approval.id}
              className={`p-0 overflow-hidden border border-white/5 ${
                index > 0 ? "opacity-75 hover:opacity-100" : ""
              } transition-opacity`}
            >
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={
                      approval.user?.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                        approval.user?.name || approval.user_id
                      }&backgroundColor=ffdfbf`
                    }
                    alt={approval.user?.name || "Utilisateur"}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {approval.user?.name || approval.user?.email || "Utilisateur"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatPeriod(approval.week_start, approval.week_end)}
                    </p>
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
                  {approval.total_hours > 40 && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">
                        Heures Supp.
                      </div>
                      <div className="text-lg font-mono font-medium text-amber-400">
                        +{(approval.total_hours - 40).toFixed(1)}h
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => handleReject(approval.id)}
                    disabled={processingId === approval.id}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 hover:text-red-400 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === approval.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Rejeter"
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id)}
                    disabled={processingId === approval.id}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === approval.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Approuver"
                    )}
                  </button>
                </div>
              </div>

              {approval.breakdown && approval.breakdown.length > 0 && (
                <div className="bg-surfaceHighlight/30 px-6 py-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {approval.breakdown.map((item, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400"
                        style={{
                          borderLeft: `2px solid ${item.color || "#8b5cf6"}`,
                        }}
                      >
                        {item.project}: {item.hours}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedApproval(approval)}
                    className="text-xs text-primary-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    Voir détails
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal Détails */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-lg p-0 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedApproval.user?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      selectedApproval.user?.name || selectedApproval.user_id
                    }&backgroundColor=ffdfbf`
                  }
                  alt={selectedApproval.user?.name || "Utilisateur"}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {selectedApproval.user?.name || "Utilisateur"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formatPeriod(selectedApproval.week_start, selectedApproval.week_end)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock className="w-4 h-4" />
                    Total Heures
                  </div>
                  <div className="text-2xl font-mono font-medium text-white">
                    {selectedApproval.totalHours}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Calendar className="w-4 h-4" />
                    Soumis le
                  </div>
                  <div className="text-sm text-white">
                    {new Date(selectedApproval.submitted_at || selectedApproval.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Répartition par projet</h4>
                <div className="space-y-2">
                  {selectedApproval.breakdown?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color || "#8b5cf6" }}
                        />
                        <span className="text-sm text-white">{item.project}</span>
                      </div>
                      <span className="text-sm font-mono text-slate-300">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              {selectedApproval.comments && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Commentaires</h4>
                  <p className="text-sm text-slate-400 bg-white/5 rounded-lg p-3">
                    {selectedApproval.comments}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/5 flex gap-3">
              <button
                onClick={() => {
                  handleReject(selectedApproval.id);
                  setSelectedApproval(null);
                }}
                disabled={processingId === selectedApproval.id}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 hover:text-red-400 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Rejeter
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedApproval.id);
                  setSelectedApproval(null);
                }}
                disabled={processingId === selectedApproval.id}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Approuver
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
