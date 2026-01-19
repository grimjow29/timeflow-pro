"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Archive,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ProjectForm } from "@/components/forms/project-form";
import { Project, CreateProjectInput } from "@/lib/types";

interface ProjectWithChildren extends Project {
  children: ProjectWithChildren[];
}

// Dropdown menu component
function ProjectActionsMenu({
  onEdit,
  onDelete,
  onArchive
}: {
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-white/10 rounded-lg shadow-xl z-50 py-1 animate-scale-in">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Modifier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onArchive();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            Archiver
          </button>
          <div className="border-t border-white/10 my-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit/Delete states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleCreateProject = async (data: CreateProjectInput) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création du projet");
      }

      // Refresh projects list
      await fetchProjects();

      // Close modal
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating project:", err);
      throw err;
    }
  };

  // Handle edit project
  const handleEditProject = async (data: CreateProjectInput) => {
    if (!editingProject) return;

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la modification du projet");
      }

      // Refresh projects list
      await fetchProjects();

      // Close modal
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
      throw err;
    }
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!deleteConfirmProject) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${deleteConfirmProject.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la suppression du projet");
      }

      // Refresh projects list
      await fetchProjects();

      // Close confirm dialog
      setDeleteConfirmProject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle archive project
  const handleArchiveProject = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'archivage du projet");
      }

      // Refresh projects list
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'archivage");
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg shadow-primary-500/20"
          >
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Creer un projet
          </button>
        </GlassCard>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nouveau Projet"
        >
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setIsModalOpen(false)}
            projects={projects}
          />
        </Modal>
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg shadow-primary-500/20"
        >
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
                  <ProjectActionsMenu
                    onEdit={() => {
                      setEditingProject(project);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={() => setDeleteConfirmProject(project)}
                    onArchive={() => handleArchiveProject(project)}
                  />
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

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau Projet"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsModalOpen(false)}
          projects={projects}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        title="Modifier le Projet"
      >
        <ProjectForm
          onSubmit={handleEditProject}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingProject(null);
          }}
          projects={projects.filter(p => p.id !== editingProject?.id)}
          initialData={editingProject || undefined}
          isEditing={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Supprimer le projet</h3>
                <p className="text-sm text-slate-400">Cette action est irréversible</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">
              Êtes-vous sûr de vouloir supprimer le projet <strong className="text-white">{deleteConfirmProject.name}</strong> ?
              Cette action ne peut pas être annulée.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmProject(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
