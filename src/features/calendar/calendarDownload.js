import { makeICS } from './icsExporter.js';

function triggerDownload(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadICSForExpense(expense) {
  triggerDownload(makeICS([expense]), `${expense.title.slice(0, 40) || 'trata'}.ics`);
}

export function downloadICSForExpenses(expenses, filename = 'finplanner.ics') {
  triggerDownload(makeICS(expenses), filename);
}
