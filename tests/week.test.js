import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  startOfWeek, weekInterval, addWeeks, daysOfWeek, isWithinWeek,
  isCurrentWeek, toISODate, fromISODate, formatWeekRange,
} from '../src/core/week.js';

test('startOfWeek returns the Monday of the same week for a Tuesday', () => {
  const tuesday = new Date(2026, 5, 30);
  assert.equal(toISODate(startOfWeek(tuesday)), '2026-06-29');
});

test('startOfWeek is idempotent on Monday itself', () => {
  const monday = new Date(2026, 5, 1);
  assert.equal(toISODate(startOfWeek(monday)), '2026-06-01');
});

test('weekInterval spans exactly 7 days, end exclusive', () => {
  const { start, end } = weekInterval(new Date(2026, 5, 30));
  assert.equal((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000), 7);
});

test('daysOfWeek returns 7 consecutive days starting Monday', () => {
  const days = daysOfWeek(startOfWeek(new Date(2026, 5, 30)));
  assert.equal(days.length, 7);
  assert.equal(toISODate(days[0]), '2026-06-29');
  assert.equal(toISODate(days[6]), '2026-07-05');
});

test('addWeeks moves by exact multiples of 7 days', () => {
  const start = startOfWeek(new Date(2026, 5, 30));
  assert.equal(toISODate(addWeeks(start, 1)), '2026-07-06');
  assert.equal(toISODate(addWeeks(start, -1)), '2026-06-22');
});

test('isWithinWeek includes boundary days and excludes the day after', () => {
  const weekStart = startOfWeek(new Date(2026, 5, 30));
  assert.ok(isWithinWeek(fromISODate('2026-06-29'), weekStart));
  assert.ok(isWithinWeek(fromISODate('2026-07-05'), weekStart));
  assert.ok(!isWithinWeek(fromISODate('2026-07-06'), weekStart));
});

test('isCurrentWeek compares week buckets, not exact dates', () => {
  const today = new Date(2026, 5, 30);
  assert.ok(!isCurrentWeek(new Date(2026, 5, 1), today));
  assert.ok(isCurrentWeek(new Date(2026, 6, 2), today));
});

test('formatWeekRange formats same-month range without repeating month', () => {
  const start = startOfWeek(new Date(2026, 5, 17));
  assert.equal(formatWeekRange(start), '15–21 июня');
});

test('formatWeekRange formats cross-month range with both months', () => {
  const start = startOfWeek(new Date(2026, 5, 30));
  assert.equal(formatWeekRange(start), '29 июня – 5 июля');
});
