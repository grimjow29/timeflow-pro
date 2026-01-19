"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, Play, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatTime, getWeekDates } from "@/lib/utils";
import { Project } from "@/lib/types";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface TimeEntryWithProject {
  id: string;
  user_id: string;
  project_id: string;
  date: string;
  duration: number;
  description: string | null;
  billable: boolean;
  timesheet_id: string | null;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string; color: string };
}

export default function TimesheetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Grid data: projectId -> dayIndex -> { minutes, entryId }
  const [timeData, setTimeData] = useState<
    Record<string, { minutes: number; entryId?: string }[]>
  >({});

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Calculer les dates de la semaine
  useEffect(() => {
    setWeekDates(getWeekDates(currentDate));
  }, [currentDate]);

  // Charger les projets via API (fonctionne en mode démo)
  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects?status=ACTIVE");
      const result = await response.json();

      if (response.ok && result.data) {
        setProjects(result.data);
        if (result.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Erreur chargement projets:", error);
    }
  }, [selectedProjectId]);

  // Construire la grille de données à partir des entrées
  const buildTimeDataGrid = useCallback((entries: TimeEntryWithProject[]) => {
    const grid: Record<string, { minutes: number; entryId?: string }[]> = {};

    // Initialiser la grille pour tous les projets
    projects.forEach((project) => {
      grid[project.id] = Array(7)
        .fill(null)
        .map(() => ({ minutes: 0, entryId: undefined }));
    });

    // Remplir avec les entrées existantes
    entries.forEach((entry) => {
      if (!grid[entry.project_id]) {
        grid[entry.project_id] = Array(7)
          .fill(null)
          .map(() => ({ minutes: 0, entryId: undefined }));
      }

      const entryDate = new Date(entry.date);
      const dayOfWeek = entryDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      grid[entry.project_id][dayIndex] = {
        minutes: entry.duration,
        entryId: entry.id,
      };
    });

    setTimeData(grid);
  }, [projects]);

  // Charger les entrées de temps pour la semaine
  const loadTimeEntries = useCallback(async () => {
    if (weekDates.length === 0) return;

    const weekStart = weekDates[0].toISOString().split("T")[0];
    const weekEnd = weekDates[6].toISOString().split("T")[0];

    try {
      const response = await fetch(
        `/api/time-entries?week_start=${weekStart}&week_end=${weekEnd}`
      );
      const result = await response.json();

      if (response.ok && result.data) {
        buildTimeDataGrid(result.data);
      }
    } catch (error) {
      console.error("Erreur chargement entrées:", error);
    } finally {
      setLoading(false);
    }
  }, [weekDates, buildTimeDataGrid]);

  // Charger les projets au montage
  useEffect(() => {
    const fetchProjects = async () => {
      await loadProjects();
    };
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger les entrées quand la semaine ou les projets changent
  useEffect(() => {
    if (weekDates.length > 0) {
      if (projects.length > 0) {
        loadTimeEntries();
      } else {
        // Pas de projets, arrêter le loading
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDates, projects.length]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
    setLoading(true);
  };

  const handleCellChange = async (
    projectId: string,
    dayIndex: number,
    value: string
  ) => {
    // Parser la valeur entrée (format HH:MM ou H)
    const parts = value.split(":");
    let minutes = 0;
    if (parts.length === 2) {
      minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 1 && parts[0] !== "-" && parts[0] !== "") {
      minutes = parseInt(parts[0]) * 60;
    }

    if (isNaN(minutes)) minutes = 0;

    // Mettre à jour l'UI immédiatement
    setTimeData((prev) => ({
      ...prev,
      [projectId]: prev[projectId]?.map((cell, i) =>
        i === dayIndex ? { ...cell, minutes } : cell
      ) || Array(7).fill(null).map(() => ({ minutes: 0 })),
    }));
  };

  // Sauvegarder une cellule quand elle perd le focus
  const handleCellBlur = async (projectId: string, dayIndex: number) => {
    const cellData = timeData[projectId]?.[dayIndex];
    if (!cellData) return;

    const date = weekDates[dayIndex]?.toISOString().split("T")[0];
    if (!date) return;

    setSaving(true);

    try {
      if (cellData.entryId) {
        // Mettre à jour l'entrée existante
        if (cellData.minutes === 0) {
          // Supprimer si durée = 0
          await fetch(`/api/time-entries/${cellData.entryId}`, {
            method: "DELETE",
          });
          setTimeData((prev) => ({
            ...prev,
            [projectId]: prev[projectId].map((cell, i) =>
              i === dayIndex ? { minutes: 0, entryId: undefined } : cell
            ),
          }));
        } else {
          // Mettre à jour
          await fetch(`/api/time-entries/${cellData.entryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ duration: cellData.minutes }),
          });
        }
      } else if (cellData.minutes > 0) {
        // Créer une nouvelle entrée
        const response = await fetch("/api/time-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            date,
            duration: cellData.minutes,
            description: "",
            billable: true,
          }),
        });

        const result = await response.json();
        if (response.ok && result.data) {
          setTimeData((prev) => ({
            ...prev,
            [projectId]: prev[projectId].map((cell, i) =>
              i === dayIndex ? { ...cell, entryId: result.data.id } : cell
            ),
          }));
        }
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdd = async (minutes: number) => {
    if (!selectedProjectId) return;

    const todayIndex = new Date().getDay();
    const dayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    const date = weekDates[dayIndex]?.toISOString().split("T")[0];
    if (!date) return;

    const currentCell = timeData[selectedProjectId]?.[dayIndex];
    const newMinutes = (currentCell?.minutes || 0) + minutes;

    // Mettre à jour l'UI
    setTimeData((prev) => ({
      ...prev,
      [selectedProjectId]: prev[selectedProjectId]?.map((cell, i) =>
        i === dayIndex ? { ...cell, minutes: newMinutes } : cell
      ) || Array(7).fill(null).map(() => ({ minutes: 0 })),
    }));

    setSaving(true);

    try {
      if (currentCell?.entryId) {
        await fetch(`/api/time-entries/${currentCell.entryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration: newMinutes }),
        });
      } else {
        const response = await fetch("/api/time-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: selectedProjectId,
            date,
            duration: newMinutes,
            description: "",
            billable: true,
          }),
        });

        const result = await response.json();
        if (response.ok && result.data) {
          setTimeData((prev) => ({
            ...prev,
            [selectedProjectId]: prev[selectedProjectId].map((cell, i) =>
              i === dayIndex ? { ...cell, entryId: result.data.id } : cell
            ),
          }));
        }
      }
    } catch (error) {
      console.error("Erreur quick add:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTimerStop = async () => {
    if (!isTimerRunning || timerSeconds < 60) {
      setIsTimerRunning(false);
      setTimerSeconds(0);
      return;
    }

    const minutes = Math.round(timerSeconds / 60);
    const todayIndex = new Date().getDay();
    const dayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    const date = weekDates[dayIndex]?.toISOString().split("T")[0];

    if (selectedProjectId && date) {
      setSaving(true);
      try {
        await fetch("/api/time-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: selectedProjectId,
            date,
            duration: minutes,
            description: description || null,
            billable: true,
          }),
        });
        await loadTimeEntries();
      } catch (error) {
        console.error("Erreur timer save:", error);
      } finally {
        setSaving(false);
      }
    }

    setIsTimerRunning(false);
    setTimerSeconds(0);
    setDescription("");
  };

  const formatCellValue = (minutes: number) => {
    if (minutes === 0) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getRowTotal = (projectId: string) => {
    return (
      timeData[projectId]?.reduce((sum, cell) => sum + cell.minutes, 0) || 0
    );
  };

  const getDayTotal = (dayIndex: number) => {
    return Object.values(timeData).reduce(
      (sum, row) => sum + (row[dayIndex]?.minutes || 0),
      0
    );
  };

  const getWeekTotal = () => {
    return Object.values(timeData).reduce(
      (sum, row) => sum + row.reduce((s, cell) => s + cell.minutes, 0),
      0
    );
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  // Soumettre le timesheet pour validation
  const handleSubmitTimesheet = async () => {
    if (weekDates.length === 0) return;

    const weekTotal = getWeekTotal();
    if (weekTotal === 0) {
      setSubmitStatus({
        type: "error",
        message: "Aucune heure saisie cette semaine",
      });
      setTimeout(() => setSubmitStatus({ type: null, message: "" }), 3000);
      return;
    }

    const weekStart = weekDates[0].toISOString().split("T")[0];
    const weekEnd = weekDates[6].toISOString().split("T")[0];

    // Collecter tous les entry IDs
    const entryIds: string[] = [];
    Object.values(timeData).forEach((row) => {
      row.forEach((cell) => {
        if (cell.entryId) {
          entryIds.push(cell.entryId);
        }
      });
    });

    setSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start: weekStart,
          week_end: weekEnd,
          total_hours: weekTotal / 60,
          entry_ids: entryIds,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message || "Timesheet soumis avec succes!",
        });
        // Rafraichir le compteur dans la sidebar
        window.dispatchEvent(new CustomEvent("approvals-updated"));
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Erreur lors de la soumission",
        });
      }
    } catch (error) {
      console.error("Erreur soumission:", error);
      setSubmitStatus({
        type: "error",
        message: "Erreur de connexion",
      });
    } finally {
      setSubmitting(false);
      // Clear status after 5 seconds
      setTimeout(() => setSubmitStatus({ type: null, message: "" }), 5000);
    }
  };

  // Filtrer les projets qui ont des entrées ou qui sont actifs
  const visibleProjects = projects.filter(
    (p) => timeData[p.id]?.some((cell) => cell.minutes > 0) || true
  );

  return (
    <div className="animate-fade-in">
      {/* Timer & Quick Actions */}
      <GlassCard className="p-4 mb-6 border-primary-500/20 shadow-glow">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sur quoi travaillez-vous ?"
              className="w-full bg-transparent border-none text-lg text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {projects.slice(0, 3).map((project) => (
                <span
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedProjectId === project.id
                      ? "text-primary-400 bg-primary-500/20"
                      : "text-slate-400 border border-white/10 hover:bg-white/5"
                  }`}
                  style={
                    selectedProjectId === project.id
                      ? { borderColor: project.color + "40" }
                      : {}
                  }
                >
                  #{project.name}
                </span>
              ))}
              {projects.length > 3 && (
                <span className="text-xs text-slate-400 border border-white/10 px-2 py-0.5 rounded cursor-pointer hover:bg-white/5 transition-colors">
                  +{projects.length - 3} projets
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-mono text-2xl text-white font-medium">
              {formatTime(timerSeconds)}
            </div>
            <button
              onClick={() =>
                isTimerRunning ? handleTimerStop() : setIsTimerRunning(true)
              }
              className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isTimerRunning
                  ? "bg-red-600 hover:bg-red-500 shadow-red-500/30"
                  : "bg-primary-600 hover:bg-primary-500 shadow-primary-500/30"
              }`}
            >
              <Play
                className={`w-5 h-5 ${isTimerRunning ? "hidden" : "ml-0.5"} fill-current`}
              />
              {isTimerRunning && <div className="w-3 h-3 bg-white rounded-sm" />}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Navigation & Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 bg-surfaceHighlight rounded-lg p-1 border border-white/5">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white px-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            {weekDates[0]?.toLocaleDateString("fr-FR", { day: "numeric" })} -{" "}
            {weekDates[6]?.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 items-center">
          {saving && (
            <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
          )}
          <button
            onClick={() => handleQuickAdd(15)}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-2 rounded-md transition-colors"
          >
            +15m
          </button>
          <button
            onClick={() => handleQuickAdd(30)}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-2 rounded-md transition-colors"
          >
            +30m
          </button>
          <button
            onClick={() => handleQuickAdd(60)}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-2 rounded-md transition-colors"
          >
            +1h
          </button>
          <button
            onClick={handleSubmitTimesheet}
            disabled={submitting}
            className="text-xs bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {submitting ? "Envoi..." : "Soumettre"}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {submitStatus.type && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm animate-fade-in ${
            submitStatus.type === "success"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {submitStatus.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {submitStatus.message}
        </div>
      )}

      {/* Timesheet Grid */}
      <GlassCard className="p-0 overflow-hidden border border-white/5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            <span className="ml-3 text-slate-400">Chargement...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surfaceHighlight/50 border-b border-white/5 text-slate-400 text-xs font-medium">
                  <th className="p-4 w-64 border-r border-white/5">Projet</th>
                  {DAYS.map((day, i) => (
                    <th
                      key={day}
                      className={`p-3 w-24 text-center border-r border-white/5 ${
                        i === todayIndex
                          ? "bg-primary-500/5 text-primary-300"
                          : i >= 5
                            ? "text-slate-600"
                            : ""
                      }`}
                    >
                      {day}{" "}
                      {weekDates[i]?.toLocaleDateString("fr-FR", {
                        day: "numeric",
                      })}
                    </th>
                  ))}
                  <th className="p-3 w-24 text-center text-slate-200 font-bold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {visibleProjects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      Aucun projet actif. Créez un projet pour commencer à saisir vos temps.
                    </td>
                  </tr>
                ) : (
                  visibleProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 border-r border-white/5">
                        <div className="flex flex-col justify-center h-12">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="font-medium text-white">
                              {project.name}
                            </span>
                          </div>
                          {project.description && (
                            <span className="text-[10px] text-slate-500 ml-4">
                              {project.description}
                            </span>
                          )}
                        </div>
                      </td>
                      {DAYS.map((_, dayIndex) => (
                        <td
                          key={dayIndex}
                          className={`p-0 border-r border-white/5 ${
                            dayIndex === todayIndex ? "bg-primary-500/5" : ""
                          } ${dayIndex >= 5 ? "bg-surface/50" : ""}`}
                        >
                          <input
                            type="text"
                            value={formatCellValue(
                              timeData[project.id]?.[dayIndex]?.minutes || 0
                            )}
                            onChange={(e) =>
                              handleCellChange(project.id, dayIndex, e.target.value)
                            }
                            onBlur={() => handleCellBlur(project.id, dayIndex)}
                            className={`w-full h-16 text-center bg-transparent border-none focus:ring-inset focus:ring-1 focus:ring-primary-500 focus:bg-primary-900/20 font-mono text-xs transition-colors ${
                              dayIndex === todayIndex
                                ? "text-white font-medium"
                                : dayIndex >= 5
                                  ? "text-slate-600"
                                  : "text-slate-300"
                            }`}
                          />
                        </td>
                      ))}
                      <td className="p-0 text-center font-mono font-medium text-white">
                        {formatCellValue(getRowTotal(project.id))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-surfaceHighlight border-t border-white/10">
                <tr className="font-medium text-white">
                  <td className="p-4 text-right text-xs uppercase tracking-wider text-slate-400">
                    Total Journalier
                  </td>
                  {DAYS.map((_, dayIndex) => (
                    <td
                      key={dayIndex}
                      className={`p-3 text-center font-mono text-xs ${
                        dayIndex === todayIndex
                          ? "text-primary-400"
                          : dayIndex >= 5
                            ? "text-slate-600"
                            : ""
                      }`}
                    >
                      {formatCellValue(getDayTotal(dayIndex))}
                    </td>
                  ))}
                  <td className="p-3 text-center font-mono text-sm text-primary-400">
                    {formatCellValue(getWeekTotal())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
