"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { FileText, FileSpreadsheet } from "lucide-react";

interface ExportCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (startDate: string, endDate: string, format: "pdf" | "excel") => void;
}

export function ExportCustomModal({
  isOpen,
  onClose,
  onExport,
}: ExportCustomModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert("Veuillez sélectionner une période");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("La date de début doit être antérieure à la date de fin");
      return;
    }

    onExport(startDate, endDate, format);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Personnalisé"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/20"
          >
            Exporter
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Période
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surfaceHighlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surfaceHighlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("pdf")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                format === "pdf"
                  ? "bg-primary-500/10 border-primary-500 text-primary-400"
                  : "bg-surfaceHighlight border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">PDF</span>
            </button>
            <button
              onClick={() => setFormat("excel")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                format === "excel"
                  ? "bg-primary-500/10 border-primary-500 text-primary-400"
                  : "bg-surfaceHighlight border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-sm font-medium">Excel</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
