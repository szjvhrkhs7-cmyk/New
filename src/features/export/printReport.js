import { categoryTitle } from '../../core/expenseCategory.js';
import { statusTitle } from '../../core/expenseStatus.js';
import { formatCurrency, formatSignedCurrency } from '../../core/currency.js';
import { effectiveAmount } from '../../core/planFact.js';

function ensurePrintArea() {
  let el = document.getElementById('print-area');
  if (!el) {
    el = document.createElement('div');
    el.id = 'print-area';
    document.body.appendChild(el);
  }
  return el;
}

export function renderPrintReport({ periodTitle, expenses, summary, breakdown }) {
  const el = ensurePrintArea();
  const sorted = [...expenses].sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));

  el.innerHTML = `
    <h1>Финансовый планировщик</h1>
    <h2>${periodTitle}</h2>
    <table class="print-summary">
      <tr><td>План</td><td>${formatCurrency(summary.plannedTotal)}</td></tr>
      <tr><td>Факт</td><td>${formatCurrency(summary.actualTotal)}</td></tr>
      <tr><td>Отклонение</td><td>${formatSignedCurrency(summary.deviation)}</td></tr>
    </table>
    <h3>По категориям</h3>
    <table class="print-breakdown">
      ${breakdown.map((b) => `<tr><td>${categoryTitle(b.category)}</td><td>${formatCurrency(b.amount)}</td></tr>`).join('')}
    </table>
    <h3>Траты</h3>
    <table class="print-table">
      <thead><tr><th>Дата</th><th>Название</th><th>Категория</th><th>Статус</th><th>План</th><th>Факт</th></tr></thead>
      <tbody>
        ${sorted.map((e) => `
          <tr>
            <td>${e.plannedDate}</td>
            <td>${escapeHtml(e.title)}</td>
            <td>${categoryTitle(e.category)}</td>
            <td>${statusTitle(e.status)}</td>
            <td>${formatCurrency(e.plannedAmount)}</td>
            <td>${formatCurrency(effectiveAmount(e))}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}

export function printReport() {
  window.print();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
