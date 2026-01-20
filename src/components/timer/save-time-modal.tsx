"use client";

import { useState, useEffect } from "react";
import { X, Clock, FolderOpen, FileText, Check, Plus, Palette } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  color: string;
}

interface SaveTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number; // in seconds
  onSave: (data: { projectId: string; description: string; duration: number }) => void;
}

// Couleurs prédéfinies pour les projets
const PROJECT_COLORS = [
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// Mock projects for demo - will be replaced with real data
const DEMO_PROJECTS: Project[] = [
  { id: "1", name: "TimeFlow Pro", color: "#8b5cf6" },
  { id: "2", name: "Client A - Site Web", color: "#3b82f6" },
  { id: "3", name: "Client B - Application", color: "#10b981" },
  { id: "4", name: "Formation interne", color: "#f59e0b" },
  { id: "5", name: "Support technique", color: "#ef4444" },
];

export function SaveTimeModal({ isOpen, onClose, duration, onSave }: SaveTimeModalProps) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New project creation state
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setProjects(data);
          }
        }
      } catch {
        // Use demo projects on error
      }
    }
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProject("");
      setDescription("");
      setSaved(false);
      setIsSaving(false);
      setShowNewProject(false);
      setNewProjectName("");
      setNewProjectColor(PROJECT_COLORS[0]);
    }
  }, [isOpen]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreatingProject(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          color: newProjectColor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newProject = data.data || data;

        // Add new project to list and select it
        setProjects((prev) => [...prev, newProject]);
        setSelectedProject(newProject.id);
        setShowNewProject(false);
        setNewProjectName("");
      } else {
        // If API fails, create local project for demo
        const localProject: Project = {
          id: `local-${Date.now()}`,
          name: newProjectName.trim(),
          color: newProjectColor,
        };
        setProjects((prev) => [...prev, localProject]);
        setSelectedProject(localProject.id);
        setShowNewProject(false);
        setNewProjectName("");
      }
    } catch {
      // Create local project on error
      const localProject: Project = {
        id: `local-${Date.now()}`,
        name: newProjectName.trim(),
        color: newProjectColor,
      };
      setProjects((prev) => [...prev, localProject]);
      setSelectedProject(localProject.id);
      setShowNewProject(false);
      setNewProjectName("");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    setIsSaving(true);

    try {
      await onSave({
        projectId: selectedProject,
        description,
        duration: Math.round(duration / 60), // Convert to minutes
      });
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onClose();
  };

  if (!isOpen) return null;

  const durationMinutes = Math.round(duration / 60);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDiscard}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Enregistrer le temps</h2>
          <button
            onClick={handleDiscard}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Duration display */}
          <div className="flex items-center gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Temps enregistré</p>
              <p className="text-2xl font-mono font-semibold text-white">
                {formatTime(duration)}
              </p>
              <p className="text-xs text-slate-500">
                {hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutes`}
              </p>
            </div>
          </div>

          {/* Project selection */}
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <FolderOpen className="w-4 h-4" />
              Projet
            </label>

            {!showNewProject ? (
              <>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-colors"
                >
                  <option value="" className="bg-surface">Sélectionner un projet...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id} className="bg-surface">
                      {project.name}
                    </option>
                  ))}
                </select>

                {/* Create new project button */}
                <button
                  onClick={() => setShowNewProject(true)}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Créer un nouveau projet
                </button>
              </>
            ) : (
              /* New project form */
              <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nom du projet"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                />

                {/* Color picker */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Palette className="w-3 h-3" />
                    Couleur
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewProjectColor(color)}
                        className={`w-7 h-7 rounded-full transition-all ${
                          newProjectColor === color
                            ? "ring-2 ring-white ring-offset-2 ring-offset-surface scale-110"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewProject(false);
                      setNewProjectName("");
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 text-sm transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || isCreatingProject}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {isCreatingProject ? (
                      "Création..."
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        Créer
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <FileText className="w-4 h-4" />
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qu'avez-vous accompli ?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-white/10 bg-white/2">
          <button
            onClick={handleDiscard}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedProject || isSaving || saved || showNewProject}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Enregistré !
              </>
            ) : isSaving ? (
              "Enregistrement..."
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
