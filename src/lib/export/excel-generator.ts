import * as XLSX from 'xlsx';

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

function minutesToDecimalHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

export function generateTimesheetExcel(data: TimesheetData): Blob {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Prepare header rows
  const headerRows = [
    ['TimeFlow Pro - Feuille de temps'],
    [],
    ['Collaborateur:', data.userName],
    ['Periode:', `${data.weekStart} - ${data.weekEnd}`],
    [],
  ];

  // Column headers
  const columnHeaders = [
    'Projet',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
    'Total',
  ];

  // Data rows with hours as decimal
  const dataRows = data.entries.map((entry, index) => {
    const rowNum = headerRows.length + 2 + index; // +2 for header row and 1-based index
    return [
      entry.project,
      minutesToDecimalHours(entry.monday),
      minutesToDecimalHours(entry.tuesday),
      minutesToDecimalHours(entry.wednesday),
      minutesToDecimalHours(entry.thursday),
      minutesToDecimalHours(entry.friday),
      minutesToDecimalHours(entry.saturday),
      minutesToDecimalHours(entry.sunday),
      { f: `SUM(B${rowNum}:H${rowNum})` }, // Formula for row total
    ];
  });

  // Total row with formulas
  const dataStartRow = headerRows.length + 2;
  const dataEndRow = dataStartRow + data.entries.length - 1;

  const totalRow = [
    'TOTAL',
    { f: `SUM(B${dataStartRow}:B${dataEndRow})` },
    { f: `SUM(C${dataStartRow}:C${dataEndRow})` },
    { f: `SUM(D${dataStartRow}:D${dataEndRow})` },
    { f: `SUM(E${dataStartRow}:E${dataEndRow})` },
    { f: `SUM(F${dataStartRow}:F${dataEndRow})` },
    { f: `SUM(G${dataStartRow}:G${dataEndRow})` },
    { f: `SUM(H${dataStartRow}:H${dataEndRow})` },
    { f: `SUM(I${dataStartRow}:I${dataEndRow})` },
  ];

  // Combine all rows
  const allRows = [
    ...headerRows,
    columnHeaders,
    ...dataRows,
    totalRow,
    [],
    [`Document genere le ${new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`],
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Project name
    { wch: 10 }, // Monday
    { wch: 10 }, // Tuesday
    { wch: 10 }, // Wednesday
    { wch: 10 }, // Thursday
    { wch: 10 }, // Friday
    { wch: 10 }, // Saturday
    { wch: 10 }, // Sunday
    { wch: 12 }, // Total
  ];

  // Merge title cell
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Merge title across columns
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // Return as Blob
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadTimesheetExcel(data: TimesheetData, filename?: string): void {
  const blob = generateTimesheetExcel(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `timesheet-${data.weekStart}-${data.weekEnd}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
