"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Play, Send } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatTime, getWeekDates } from "@/lib/utils";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Mock projects for now
const projects = [
  { id: "1", name: "Client A", task: "Design UI" },
  { id: "2", name: "Client B", task: "Backend Dev" },
];

export default function TimesheetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [description, setDescription] = useState("");

  // Grid data: projectId -> dayIndex -> minutes
  const [timeData, setTimeData] = useState<Record<string, number[]>>({
    "1": [240, 210, 240, 120, 180, 0, 0],
    "2": [180, 240, 210, 300, 240, 0, 0],
  });

  useEffect(() => {
    setWeekDates(getWeekDates(currentDate));
  }, [currentDate]);

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
  };

  const handleQuickAdd = (minutes: number) => {
    // TODO: Add to selected cell or current day
    console.log(`Quick add ${minutes} minutes`);
  };

  const handleCellChange = (projectId: string, dayIndex: number, value: string) => {
    const parts = value.split(":");
    let minutes = 0;
    if (parts.length === 2) {
      minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 1) {
      minutes = parseInt(parts[0]) * 60;
    }

    setTimeData((prev) => ({
      ...prev,
      [projectId]: prev[projectId].map((m, i) => (i === dayIndex ? minutes : m)),
    }));
  };

  const formatCellValue = (minutes: number) => {
    if (minutes === 0) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getRowTotal = (projectId: string) => {
    return timeData[projectId]?.reduce((sum, m) => sum + m, 0) || 0;
  };

  const getDayTotal = (dayIndex: number) => {
    return Object.values(timeData).reduce(
      (sum, row) => sum + (row[dayIndex] || 0),
      0
    );
  };

  const getWeekTotal = () => {
    return Object.values(timeData).reduce(
      (sum, row) => sum + row.reduce((s, m) => s + m, 0),
      0
    );
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

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
            <div className="flex gap-2 mt-2">
              <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded cursor-pointer hover:bg-primary-500/20 transition-colors">
                #Client A
              </span>
              <span className="text-xs text-slate-400 border border-white/10 px-2 py-0.5 rounded cursor-pointer hover:bg-white/5 transition-colors">
                + Projet
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-mono text-2xl text-white font-medium">
              {formatTime(timerSeconds)}
            </div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isTimerRunning
                  ? "bg-red-600 hover:bg-red-500 shadow-red-500/30"
                  : "bg-primary-600 hover:bg-primary-500 shadow-primary-500/30"
              }`}
            >
              <Play
                className={`w-5 h-5 ${isTimerRunning ? "hidden" : "ml-0.5"} fill-current`}
              />
              {isTimerRunning && (
                <div className="w-3 h-3 bg-white rounded-sm" />
              )}
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

        <div className="flex gap-2">
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
          <button className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-md transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2">
            <Send className="w-3 h-3" />
            Soumettre
          </button>
        </div>
      </div>

      {/* Timesheet Grid */}
      <GlassCard className="p-0 overflow-hidden border border-white/5">
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
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 border-r border-white/5">
                    <div className="flex flex-col justify-center h-12">
                      <span className="font-medium text-white">
                        {project.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {project.task}
                      </span>
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
                          timeData[project.id]?.[dayIndex] || 0
                        )}
                        onChange={(e) =>
                          handleCellChange(project.id, dayIndex, e.target.value)
                        }
                        disabled={dayIndex >= 5}
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
              ))}
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
      </GlassCard>
    </div>
  );
}
