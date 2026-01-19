"use client";

import { useState, useEffect } from "react";
import { X, Clock, FolderOpen, FileText, Check } from "lucide-react";
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
    }
  }, [isOpen]);

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
            disabled={!selectedProject || isSaving || saved}
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
