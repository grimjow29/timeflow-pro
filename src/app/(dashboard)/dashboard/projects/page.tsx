"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/types";

interface ProjectWithChildren extends Project {
  children: ProjectWithChildren[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/projects");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors du chargement des projets");
      }

      setProjects(result.data || []);
      // Expand first project by default if exists
      if (result.data?.length > 0) {
        setExpandedProjects([result.data[0].id]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">ACTIF</Badge>;
      case "PAUSED":
        return <Badge variant="warning">PAUSE</Badge>;
      case "COMPLETED":
        return <Badge variant="info">TERMINE</Badge>;
      default:
        return <Badge>ARCHIVE</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium tracking-tight text-white">
            Projets
          </h2>
        </div>
        <GlassCard className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <span className="ml-3 text-slate-400">Chargement des projets...</span>
        </GlassCard>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium tracking-tight text-white">
            Projets
          </h2>
        </div>
        <GlassCard className="p-12 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reessayer
          </button>
        </GlassCard>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium tracking-tight text-white">
            Projets
          </h2>
          <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg shadow-primary-500/20">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </button>
        </div>
        <GlassCard className="p-12 flex flex-col items-center justify-center">
          <Folder className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucun projet</h3>
          <p className="text-slate-400 text-center mb-6">
            Creez votre premier projet pour commencer a suivre votre temps.
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Creer un projet
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Projets
        </h2>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg shadow-primary-500/20">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </button>
      </div>

      {/* Projects List */}
      <GlassCard className="p-0 overflow-hidden border border-white/5">
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-surfaceHighlight/30 flex text-xs font-medium text-slate-400 uppercase tracking-wider">
          <div className="flex-1 pl-2">Nom du projet</div>
          <div className="w-32 text-center">Budget</div>
          <div className="w-32 text-center">Statut</div>
          <div className="w-16"></div>
        </div>

        {/* Projects */}
        {projects.map((project) => {
          const isExpanded = expandedProjects.includes(project.id);
          const hasChildren = project.children && project.children.length > 0;

          return (
            <div key={project.id} className="border-b border-white/5">
              {/* Main Project Row */}
              <div
                className="flex items-center p-4 hover:bg-white/5 cursor-pointer group transition-colors"
                onClick={() => hasChildren && toggleProject(project.id)}
              >
                <div className="flex-1 flex items-center gap-3">
                  <button
                    className={`text-slate-500 hover:text-white ${!hasChildren ? 'invisible' : ''}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: `${project.color}20`,
                      color: project.color,
                    }}
                  >
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-slate-500">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-32 px-4">
                  {project.budget ? (
                    <>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>0h</span>
                        <span>{project.budget}h</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "0%",
                            backgroundColor: project.color,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">Non defini</span>
                  )}
                </div>

                <div className="w-32 text-center">
                  {getStatusBadge(project.status)}
                </div>

                <div className="w-16 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="text-slate-400 hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub Projects */}
              {isExpanded && hasChildren && (
                <div className="bg-surface/50 pl-12 border-t border-white/5">
                  {project.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center p-3 hover:bg-white/5 border-l-2 border-primary-500/30"
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-1 h-1 bg-slate-500 rounded-full" />
                        <span className="text-sm text-slate-300">
                          {child.name}
                        </span>
                      </div>
                      <div className="w-32 px-4 text-right text-xs text-slate-400 font-mono">
                        {child.budget ? `${child.budget}h` : "-"}
                      </div>
                      <div className="w-32 text-center">
                        {getStatusBadge(child.status)}
                      </div>
                      <div className="w-16"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
}
