import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeICS } from '../src/features/calendar/icsExporter.js';

function expense(overrides) {
  return {
    id: 'abc123',
    title: 'Продукты',
    plannedAmount: 1200,
    category: 'groceries',
    plannedDate: '2026-06-15',
    note: '',
    status: 'planned',
    ...overrides,
  };
}

test('makeICS produces a well-formed VCALENDAR with one VEVENT', () => {
  const ics = makeICS([expense({})], { now: new Date(Date.UTC(2026, 5, 1)) });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 1);
  assert.match(ics, /DTSTART;VALUE=DATE:20260615/);
  assert.match(ics, /DTEND;VALUE=DATE:20260616/);
  assert.match(ics, /UID:abc123@finplanner/);
});

test('makeICS escapes semicolons and commas in notes', () => {
  const ics = makeICS([expense({ note: 'Обед; кафе, чай' })], { now: new Date() });
  assert.match(ics, /DESCRIPTION:Обед\\; кафе\\, чай/);
});

test('makeICS omits DESCRIPTION when there is no note', () => {
  const ics = makeICS([expense({ note: '' })], { now: new Date() });
  assert.doesNotMatch(ics, /DESCRIPTION/);
});

test('makeICS handles an empty expense list', () => {
  const ics = makeICS([], { now: new Date() });
  assert.equal(ics.match(/BEGIN:VEVENT/g), null);
  assert.match(ics, /BEGIN:VCALENDAR/);
});
