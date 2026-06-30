import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summary, categoryBreakdown, effectiveAmount, itemDeviation } from '../src/core/planFact.js';
import { ExpenseStatus } from '../src/core/expenseStatus.js';
import { ExpenseCategory } from '../src/core/expenseCategory.js';

function expense(overrides) {
  return {
    id: 'x',
    title: 'Тест',
    plannedAmount: 0,
    actualAmount: null,
    category: ExpenseCategory.other,
    plannedDate: '2026-06-01',
    note: '',
    status: ExpenseStatus.planned,
    ...overrides,
  };
}

test('summary of empty list is zero', () => {
  const s = summary([]);
  assert.deepEqual(s, { plannedTotal: 0, actualTotal: 0, deviation: 0, completionRatio: null });
});

test('summary of a still-planned expense has null completionRatio', () => {
  const s = summary([expense({ plannedAmount: 500 })]);
  assert.equal(s.plannedTotal, 500);
  assert.equal(s.actualTotal, 0);
  assert.equal(s.completionRatio, null);
});

test('summary of a completed overspend expense', () => {
  const s = summary([expense({ plannedAmount: 300, actualAmount: 450, status: ExpenseStatus.completed })]);
  assert.equal(s.deviation, 150);
  assert.equal(s.completionRatio, 1.5);
});

test('summary of a cancelled expense contributes zero actual', () => {
  const s = summary([expense({ plannedAmount: 800, status: ExpenseStatus.cancelled })]);
  assert.equal(s.actualTotal, 0);
  assert.equal(s.deviation, -800);
  assert.equal(s.completionRatio, 0);
});

test('effectiveAmount falls back to plannedAmount when actualAmount is null', () => {
  const e = expense({ plannedAmount: 100, status: ExpenseStatus.completed });
  assert.equal(effectiveAmount(e), 100);
});

test('itemDeviation is zero for a still-planned expense', () => {
  assert.equal(itemDeviation(expense({ plannedAmount: 200 })), 0);
});

test('categoryBreakdown groups, sums, excludes zero, sorts descending', () => {
  const expenses = [
    expense({ category: ExpenseCategory.groceries, plannedAmount: 100 }),
    expense({ category: ExpenseCategory.groceries, plannedAmount: 50, status: ExpenseStatus.completed, actualAmount: 20 }),
    expense({ category: ExpenseCategory.transport, plannedAmount: 300 }),
    expense({ category: ExpenseCategory.health, plannedAmount: 999, status: ExpenseStatus.cancelled }),
  ];
  const breakdown = categoryBreakdown(expenses);
  assert.deepEqual(breakdown, [
    { category: ExpenseCategory.transport, amount: 300 },
    { category: ExpenseCategory.groceries, amount: 120 },
  ]);
});
