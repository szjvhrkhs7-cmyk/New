import { categoryTitle } from '../../core/expenseCategory.js';
import { statusTitle } from '../../core/expenseStatus.js';
import { effectiveAmount } from '../../core/planFact.js';

const HEADER = ['Дата', 'Название', 'Категория', 'Статус', 'План', 'Факт', 'Заметка'];

function escapeField(value) {
  const text = String(value ?? '');
  return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function makeCSV(expenses) {
  const rows = [...expenses]
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
    .map((e) => [
      e.plannedDate,
      e.title,
      categoryTitle(e.category),
      statusTitle(e.status),
      e.plannedAmount,
      effectiveAmount(e),
      e.note ?? '',
    ]);
  const lines = [HEADER, ...rows].map((row) => row.map(escapeField).join(';'));
  return lines.join('\r\n') + '\r\n';
}
