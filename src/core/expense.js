import { ExpenseStatus } from './expenseStatus.js';
import { toISODate } from './week.js';

export function createId() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

export function makeExpense({ title, plannedAmount, category, plannedDate, note = '' }) {
  return {
    id: createId(),
    title: title.trim(),
    plannedAmount,
    actualAmount: null,
    category,
    plannedDate: toISODate(plannedDate),
    note: note.trim(),
    status: ExpenseStatus.planned,
    calendarEventAdded: false,
    createdAt: Date.now(),
  };
}
