"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CreateProjectInput, Project, ProjectStatus } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ProjectFormProps {
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
  projects: Project[];
  initialData?: Project; // For editing
  isEditing?: boolean;
}

const PRESET_COLORS = [
  { value: "#8b5cf6", label: "Violet" },
  { value: "#a855f7", label: "Pourpre" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#10b981", label: "Vert" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#ec4899", label: "Rose" },
  { value: "#6366f1", label: "Indigo" },
];

export function ProjectForm({ onSubmit, onCancel, projects, initialData, isEditing }: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectInput & { status?: ProjectStatus }>({
    name: "",
    description: "",
    color: "#8b5cf6",
    parent_id: "",
    billable: true,
    hourly_rate: undefined,
    budget: undefined,
    status: "ACTIVE",
  });

  // Initialize form with existing data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        color: initialData.color,
        parent_id: initialData.parent_id || "",
        billable: initialData.billable,
        hourly_rate: initialData.hourly_rate || undefined,
        budget: initialData.budget || undefined,
        status: initialData.status,
      });
    }
  }, [initialData, isEditing]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du projet est requis";
    }

    if (formData.billable && formData.hourly_rate && formData.hourly_rate <= 0) {
      newErrors.hourly_rate = "Le taux horaire doit être supérieur à 0";
    }

    if (formData.budget && formData.budget <= 0) {
      newErrors.budget = "Le budget doit être supérieur à 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        parent_id: formData.parent_id || undefined,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out projects to get only parent projects
  const parentProjects = projects.filter((p) => !p.parent_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nom du projet"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Ex: Développement site web"
        autoFocus
      />

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg bg-surface border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors resize-none"
          placeholder="Description du projet (optionnel)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Couleur
          </label>
          <div className="flex gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                className={`w-8 h-8 rounded-lg transition-all ${
                  formData.color === color.value
                    ? "ring-2 ring-white scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        <Select
          label="Projet parent"
          name="parent_id"
          value={formData.parent_id}
          onChange={handleChange}
          options={[
            { value: "", label: "Aucun (projet racine)" },
            ...parentProjects.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="billable"
          name="billable"
          checked={formData.billable}
          onChange={handleChange}
          className="w-4 h-4 rounded border-white/10 bg-surface text-primary-500 focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
        />
        <label htmlFor="billable" className="text-sm text-slate-300 cursor-pointer">
          Projet facturable
        </label>
      </div>

      {formData.billable && (
        <Input
          label="Taux horaire (€)"
          name="hourly_rate"
          type="number"
          value={formData.hourly_rate ?? ""}
          onChange={handleChange}
          error={errors.hourly_rate}
          placeholder="Ex: 75"
          min="0"
          step="0.01"
        />
      )}

      <Input
        label="Budget (heures)"
        name="budget"
        type="number"
        value={formData.budget ?? ""}
        onChange={handleChange}
        error={errors.budget}
        placeholder="Ex: 100"
        min="0"
        step="1"
      />

      {/* Status selector - only show when editing */}
      {isEditing && (
        <Select
          label="Statut"
          name="status"
          value={formData.status || "ACTIVE"}
          onChange={handleChange}
          options={[
            { value: "ACTIVE", label: "Actif" },
            { value: "PAUSED", label: "En pause" },
            { value: "COMPLETED", label: "Terminé" },
            { value: "ARCHIVED", label: "Archivé" },
          ]}
        />
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? "Modification..." : "Création..."}
            </>
          ) : (
            isEditing ? "Modifier le projet" : "Créer le projet"
          )}
        </button>
      </div>
    </form>
  );
}
