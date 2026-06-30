import { startOfWeek, addWeeks, isWithinWeek, fromISODate } from '../../core/week.js';
import { summary } from '../../core/planFact.js';

export function weeklyTrend(expenses, { start, end }) {
  const points = [];
  let weekStart = startOfWeek(start);
  while (weekStart.getTime() < end.getTime()) {
    const expensesInWeek = expenses.filter((e) => isWithinWeek(fromISODate(e.plannedDate), weekStart));
    points.push({ weekStart, summary: summary(expensesInWeek) });
    weekStart = addWeeks(weekStart, 1);
  }
  return points;
}
