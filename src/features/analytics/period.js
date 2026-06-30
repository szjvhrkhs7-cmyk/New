export const AnalyticsPeriod = Object.freeze({ month: 'month', quarter: 'quarter' });

export function periodRange(period, containing = new Date()) {
  const year = containing.getFullYear();
  if (period === AnalyticsPeriod.quarter) {
    const quarterIndex = Math.floor(containing.getMonth() / 3);
    const start = new Date(year, quarterIndex * 3, 1);
    const end = new Date(year, quarterIndex * 3 + 3, 1);
    return { start, end };
  }
  const start = new Date(year, containing.getMonth(), 1);
  const end = new Date(year, containing.getMonth() + 1, 1);
  return { start, end };
}

export function periodTitle(period, containing = new Date()) {
  const { start } = periodRange(period, containing);
  if (period === AnalyticsPeriod.quarter) {
    const quarterIndex = Math.floor(start.getMonth() / 3) + 1;
    return `${quarterIndex} квартал ${start.getFullYear()}`;
  }
  const formatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
  return formatter.format(start);
}
