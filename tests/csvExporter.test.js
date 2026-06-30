import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCSV } from '../src/features/export/csvExporter.js';

function expense(overrides) {
  return {
    id: 'a', title: 'Обед', plannedAmount: 500, actualAmount: null,
    category: 'groceries', plannedDate: '2026-06-10', note: '', status: 'planned',
    ...overrides,
  };
}

test('makeCSV starts with the expected header row', () => {
  const csv = makeCSV([]);
  assert.equal(csv.split('\r\n')[0], 'Дата;Название;Категория;Статус;План;Факт;Заметка');
});

test('makeCSV sorts rows by date ascending', () => {
  const csv = makeCSV([
    expense({ plannedDate: '2026-06-20', title: 'Поздно' }),
    expense({ plannedDate: '2026-06-01', title: 'Рано' }),
  ]);
  const lines = csv.trim().split('\r\n');
  assert.ok(lines[1].includes('Рано'));
  assert.ok(lines[2].includes('Поздно'));
});

test('makeCSV quotes fields containing the delimiter', () => {
  const csv = makeCSV([expense({ note: 'Обед; кафе' })]);
  assert.ok(csv.includes('"Обед; кафе"'));
});

test('makeCSV quotes and escapes embedded quotes', () => {
  const csv = makeCSV([expense({ note: 'Say "hi"' })]);
  assert.ok(csv.includes('"Say ""hi"""'));
});
