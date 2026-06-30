import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weeklyTrend } from '../src/features/analytics/weeklyTrend.js';
import { toISODate } from '../src/core/week.js';

function expense(date, plannedAmount) {
  return {
    id: date, title: 't', plannedAmount, actualAmount: null,
    category: 'other', plannedDate: date, note: '', status: 'planned',
  };
}

test('weeklyTrend buckets expenses into the correct ISO weeks', () => {
  const expenses = [
    expense('2026-06-02', 100),
    expense('2026-06-05', 50),
    expense('2026-06-09', 200),
  ];
  const points = weeklyTrend(expenses, { start: new Date(2026, 5, 1), end: new Date(2026, 5, 15) });
  assert.equal(points.length, 2);
  assert.equal(toISODate(points[0].weekStart), '2026-06-01');
  assert.equal(points[0].summary.plannedTotal, 150);
  assert.equal(toISODate(points[1].weekStart), '2026-06-08');
  assert.equal(points[1].summary.plannedTotal, 200);
});

test('weeklyTrend still emits zero-total weeks with no expenses', () => {
  const points = weeklyTrend([], { start: new Date(2026, 5, 1), end: new Date(2026, 5, 22) });
  assert.equal(points.length, 3);
  for (const point of points) assert.equal(point.summary.plannedTotal, 0);
});

test('weeklyTrend spans three weeks correctly across a month boundary', () => {
  const expenses = [expense('2026-06-29', 10), expense('2026-07-02', 20)];
  const points = weeklyTrend(expenses, { start: new Date(2026, 5, 22), end: new Date(2026, 6, 6) });
  assert.equal(points.length, 2);
  assert.equal(toISODate(points[0].weekStart), '2026-06-22');
  assert.equal(points[0].summary.plannedTotal, 0);
  assert.equal(toISODate(points[1].weekStart), '2026-06-29');
  assert.equal(points[1].summary.plannedTotal, 30);
});
