'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { downloadTimesheetPDF, type TimesheetData } from '@/lib/export/pdf-generator';
import { downloadTimesheetExcel } from '@/lib/export/excel-generator';

interface ExportButtonProps {
  data: TimesheetData;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({ data, disabled = false, className = '' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      // Small delay for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 100));
      downloadTimesheetPDF(data);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      // Small delay for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 100));
      downloadTimesheetExcel(data);
    } catch (error) {
      console.error('Erreur export Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
        <span>{isExporting ? 'Export...' : 'Exporter'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <div>
              <div className="font-medium">Exporter en PDF</div>
              <div className="text-xs text-slate-500">Document formaté</div>
            </div>
          </button>

          <div className="border-t border-white/5" />

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-400" />
            <div>
              <div className="font-medium">Exporter en Excel</div>
              <div className="text-xs text-slate-500">Avec formules</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
