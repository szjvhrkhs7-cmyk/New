import { ExpenseStatus } from './expenseStatus.js';
import { ALL_CATEGORIES } from './expenseCategory.js';

export function effectiveAmount(expense) {
  switch (expense.status) {
    case ExpenseStatus.completed:
      return expense.actualAmount ?? expense.plannedAmount;
    case ExpenseStatus.cancelled:
      return 0;
    default:
      return expense.plannedAmount;
  }
}

export function itemDeviation(expense) {
  switch (expense.status) {
    case ExpenseStatus.completed:
      return (expense.actualAmount ?? expense.plannedAmount) - expense.plannedAmount;
    case ExpenseStatus.cancelled:
      return -expense.plannedAmount;
    default:
      return 0;
  }
}

export const ZERO_SUMMARY = Object.freeze({
  plannedTotal: 0,
  actualTotal: 0,
  deviation: 0,
  completionRatio: null,
});

export function summary(expenses) {
  if (expenses.length === 0) return { ...ZERO_SUMMARY };

  let plannedTotal = 0;
  let actualTotal = 0;
  let reconciledPlannedTotal = 0;
  let reconciledCount = 0;

  for (const expense of expenses) {
    plannedTotal += expense.plannedAmount;
    if (expense.status === ExpenseStatus.completed) {
      actualTotal += expense.actualAmount ?? expense.plannedAmount;
    }
    if (expense.status !== ExpenseStatus.planned) {
      reconciledPlannedTotal += expense.plannedAmount;
      reconciledCount += 1;
    }
  }

  return {
    plannedTotal,
    actualTotal,
    deviation: actualTotal - plannedTotal,
    completionRatio: reconciledCount > 0 ? actualTotal / reconciledPlannedTotal : null,
  };
}

export function categoryBreakdown(expenses, categories = ALL_CATEGORIES) {
  const totals = new Map(categories.map((category) => [category, 0]));
  for (const expense of expenses) {
    const current = totals.get(expense.category) ?? 0;
    totals.set(expense.category, current + effectiveAmount(expense));
  }
  return [...totals.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}
