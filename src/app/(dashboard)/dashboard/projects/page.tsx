"use client";

import { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Smartphone,
  MoreHorizontal,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

// Mock data
const projectsData = [
  {
    id: "1",
    name: "Client ABC Corp",
    description: "Refonte Site Web",
    color: "#8b5cf6",
    icon: Briefcase,
    hoursSpent: 75,
    budgetHours: 100,
    status: "ACTIVE" as const,
    children: [
      { id: "1-1", name: "Phase 1: Design", hours: "30:00", budget: "40h" },
      { id: "1-2", name: "Phase 2: Développement", hours: "45:00", budget: "60h" },
    ],
  },
  {
    id: "2",
    name: "Mobile App",
    description: "iOS & Android",
    color: "#ec4899",
    icon: Smartphone,
    hoursSpent: 12,
    budgetHours: 200,
    status: "PAUSED" as const,
    children: [],
  },
];

export default function ProjectsPage() {
  const [expandedProjects, setExpandedProjects] = useState<string[]>(["1"]);

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
        return <Badge variant="warning">PAUSÉ</Badge>;
      case "COMPLETED":
        return <Badge variant="info">TERMINÉ</Badge>;
      default:
        return <Badge>ARCHIVÉ</Badge>;
    }
  };

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
        {projectsData.map((project) => {
          const isExpanded = expandedProjects.includes(project.id);
          const Icon = project.icon;
          const progress = (project.hoursSpent / project.budgetHours) * 100;

          return (
            <div key={project.id} className="border-b border-white/5">
              {/* Main Project Row */}
              <div
                className="flex items-center p-4 hover:bg-white/5 cursor-pointer group transition-colors"
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex-1 flex items-center gap-3">
                  <button className="text-slate-500 hover:text-white">
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
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="w-32 px-4">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{project.hoursSpent}h</span>
                    <span>{project.budgetHours}h</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
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
              {isExpanded && project.children.length > 0 && (
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
                        {child.hours} / {child.budget}
                      </div>
                      <div className="w-32 text-center"></div>
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
