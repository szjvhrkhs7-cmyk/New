const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function dateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, days) {
  const d = dateOnly(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeek(date) {
  const d = dateOnly(date);
  const isoWeekday = (d.getDay() + 6) % 7; // 0 = Monday
  return addDays(d, -isoWeekday);
}

export function weekInterval(date) {
  const start = startOfWeek(date);
  const end = addDays(start, 7);
  return { start, end };
}

export function addWeeks(weekStart, count) {
  return addDays(weekStart, count * 7);
}

export function daysOfWeek(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isWithinWeek(date, weekStart) {
  const { start, end } = weekInterval(weekStart);
  const t = dateOnly(date).getTime();
  return t >= start.getTime() && t < end.getTime();
}

export function isCurrentWeek(weekStart, today = new Date()) {
  return startOfWeek(weekStart).getTime() === startOfWeek(today).getTime();
}

export function toISODate(date) {
  const d = dateOnly(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatWeekRange(weekStart) {
  const start = startOfWeek(weekStart);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_GENITIVE[start.getMonth()]}`;
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const startPart = `${start.getDate()} ${MONTHS_GENITIVE[start.getMonth()]}`;
  const endPart = sameYear
    ? `${end.getDate()} ${MONTHS_GENITIVE[end.getMonth()]}`
    : `${end.getDate()} ${MONTHS_GENITIVE[end.getMonth()]} ${end.getFullYear()}`;
  return `${startPart} – ${endPart}`;
}

export function formatDayLabel(date) {
  const d = dateOnly(date);
  return `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`;
}
