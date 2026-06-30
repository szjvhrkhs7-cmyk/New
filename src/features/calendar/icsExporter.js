import { fromISODate } from '../../core/week.js';
import { formatCurrency } from '../../core/currency.js';

function escapeText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function dateStamp(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function allDayValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function nextDay(date) {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
}

function eventBlock(expense, now) {
  const start = fromISODate(expense.plannedDate);
  const end = nextDay(start);
  const summary = `${expense.title} — ${formatCurrency(expense.plannedAmount)}`;
  const lines = [
    'BEGIN:VEVENT',
    `UID:${expense.id}@finplanner`,
    `DTSTAMP:${dateStamp(now)}`,
    `DTSTART;VALUE=DATE:${allDayValue(start)}`,
    `DTEND;VALUE=DATE:${allDayValue(end)}`,
    `SUMMARY:${escapeText(summary)}`,
  ];
  if (expense.note) {
    lines.push(`DESCRIPTION:${escapeText(expense.note)}`);
  }
  lines.push('END:VEVENT');
  return lines;
}

export function makeICS(expenses, { calendarName = 'Финансовый планировщик', now = new Date() } = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FinPlanner//RU',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];
  for (const expense of expenses) {
    lines.push(...eventBlock(expense, now));
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
