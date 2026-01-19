"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { BarChart3, Download, Calendar, FileText, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { ExportCustomModal } from "@/components/features/ExportCustomModal";
import { useProjects } from "@/hooks/useReports";
import {
  transformToTimesheetData,
  getCurrentWeek,
  getCurrentMonth,
  formatDateForAPI,
} from "@/lib/export/transform-data";
import { downloadTimesheetPDF } from "@/lib/export/pdf-generator";
import { downloadTimesheetExcel } from "@/lib/export/excel-generator";

export default function ReportsPage() {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: projects = [] } = useProjects();

  // Fonction pour exporter un rapport
  const handleExport = async (
    startDate: Date,
    endDate: Date,
    format: "pdf" | "excel",
    reportName: string
  ) => {
    setIsExporting(true);

    try {
      // Récupérer les données
      const response = await fetch(
        `/api/time-entries?week_start=${formatDateForAPI(startDate)}&week_end=${formatDateForAPI(endDate)}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const data = await response.json();
      const timeEntries = data.data || [];

      // Transformer les données
      const timesheetData = transformToTimesheetData(
        timeEntries,
        projects,
        "Utilisateur", // TODO: Récupérer le vrai nom de l'utilisateur
        startDate,
        endDate
      );

      // Télécharger le fichier
      if (format === "pdf") {
        downloadTimesheetPDF(timesheetData, reportName);
      } else {
        downloadTimesheetExcel(timesheetData, reportName);
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Une erreur est survenue lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  // Rapport hebdomadaire
  const handleWeeklyReport = () => {
    const { start, end } = getCurrentWeek();
    handleExport(start, end, "pdf", `rapport-hebdomadaire-${formatDateForAPI(start)}`);
  };

  // Rapport mensuel
  const handleMonthlyReport = () => {
    const { start, end } = getCurrentMonth();
    const monthName = start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    handleExport(start, end, "pdf", `rapport-mensuel-${monthName.replace(" ", "-")}`);
  };

  // Export personnalisé
  const handleCustomExport = (startDate: string, endDate: string, format: "pdf" | "excel") => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    handleExport(start, end, format, `rapport-personnalise-${startDate}-${endDate}`);
  };

  // Export rapide depuis le bouton dropdown
  const handleQuickExport = (format: "pdf" | "excel") => {
    const { start, end } = getCurrentWeek();
    handleExport(start, end, format, `export-${formatDateForAPI(start)}`);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Rapports
        </h2>

        <Dropdown
          trigger={
            <button
              disabled={isExporting}
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Export en cours..." : "Exporter"}
            </button>
          }
        >
          <DropdownItem
            onClick={() => handleQuickExport("pdf")}
            icon={<FileText className="w-4 h-4" />}
          >
            Export PDF
          </DropdownItem>
          <DropdownItem
            onClick={() => handleQuickExport("excel")}
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export Excel
          </DropdownItem>
        </Dropdown>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rapport Hebdomadaire */}
        <GlassCard
          onClick={handleWeeklyReport}
          className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Rapport Hebdomadaire
          </h3>
          <p className="text-sm text-slate-400">
            Résumé des heures de la semaine
          </p>
        </GlassCard>

        {/* Rapport Mensuel */}
        <GlassCard
          onClick={handleMonthlyReport}
          className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Rapport Mensuel
          </h3>
          <p className="text-sm text-slate-400">
            Analyse mensuelle par projet
          </p>
        </GlassCard>

        {/* Export Personnalisé */}
        <GlassCard
          onClick={() => setIsCustomModalOpen(true)}
          className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Export Personnalisé
          </h3>
          <p className="text-sm text-slate-400">
            Créer un rapport sur mesure
          </p>
        </GlassCard>
      </div>

      {/* Modal Export Personnalisé */}
      <ExportCustomModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onExport={handleCustomExport}
      />
    </div>
  );
}
