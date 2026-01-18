import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TimesheetEntry {
  project: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  total: number;
}

export interface TimesheetData {
  userName: string;
  weekStart: string;
  weekEnd: string;
  entries: TimesheetEntry[];
  totalHours: number;
}

function formatHours(minutes: number): string {
  if (minutes === 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

export function generateTimesheetPDF(data: TimesheetData): Blob {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // primary-500 color
  doc.text('TimeFlow Pro', 14, 20);

  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('Feuille de temps', 14, 30);

  // Info section
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Collaborateur: ${data.userName}`, 14, 42);
  doc.text(`Periode: ${data.weekStart} - ${data.weekEnd}`, 14, 48);

  // Table data
  const tableHeaders = [
    'Projet',
    'Lun',
    'Mar',
    'Mer',
    'Jeu',
    'Ven',
    'Sam',
    'Dim',
    'Total',
  ];

  const tableBody = data.entries.map((entry) => [
    entry.project,
    formatHours(entry.monday),
    formatHours(entry.tuesday),
    formatHours(entry.wednesday),
    formatHours(entry.thursday),
    formatHours(entry.friday),
    formatHours(entry.saturday),
    formatHours(entry.sunday),
    formatHours(entry.total),
  ]);

  // Add total row
  const totals = data.entries.reduce(
    (acc, entry) => ({
      monday: acc.monday + entry.monday,
      tuesday: acc.tuesday + entry.tuesday,
      wednesday: acc.wednesday + entry.wednesday,
      thursday: acc.thursday + entry.thursday,
      friday: acc.friday + entry.friday,
      saturday: acc.saturday + entry.saturday,
      sunday: acc.sunday + entry.sunday,
    }),
    { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }
  );

  tableBody.push([
    'TOTAL',
    formatHours(totals.monday),
    formatHours(totals.tuesday),
    formatHours(totals.wednesday),
    formatHours(totals.thursday),
    formatHours(totals.friday),
    formatHours(totals.saturday),
    formatHours(totals.sunday),
    formatHours(data.totalHours),
  ]);

  // Generate table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableBody,
    startY: 55,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // primary-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 60 },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22, fillColor: [241, 245, 249] }, // slate-100 for weekend
      7: { cellWidth: 22, fillColor: [241, 245, 249] }, // slate-100 for weekend
      8: { cellWidth: 28, fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      // Style the total row
      if (hookData.row.index === tableBody.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [226, 232, 240]; // slate-200
      }
    },
  });

  // Footer with generation date
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 150;

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  const generationDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Document genere le ${generationDate}`, 14, finalY + 15);
  doc.text('TimeFlow Pro - Gestion du temps', pageWidth - 14, finalY + 15, { align: 'right' });

  // Return as Blob
  return doc.output('blob');
}

export function downloadTimesheetPDF(data: TimesheetData, filename?: string): void {
  const blob = generateTimesheetPDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `timesheet-${data.weekStart}-${data.weekEnd}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
