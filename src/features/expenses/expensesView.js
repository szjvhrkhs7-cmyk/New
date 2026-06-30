import { expenseStore } from '../../state/store.js';
import { sortExpenses, sortOptionTitle, ExpenseSortOption } from '../../core/sort.js';
import { formatWeekRange, addWeeks, isWithinWeek, fromISODate } from '../../core/week.js';
import { formatCurrency, formatSignedCurrency } from '../../core/currency.js';
import { summary } from '../../core/planFact.js';
import { categoryIcon, categoryTint, categoryTitle } from '../../core/expenseCategory.js';
import { statusTitle, ExpenseStatus } from '../../core/expenseStatus.js';
import { openExpenseForm } from './expenseForm.js';
import { openReconcileSheet } from './reconcileSheet.js';

function planFactIndicator(s) {
  if (s.completionRatio === null) {
    return `<div class="plan-fact-indicator muted">Пока нет завершённых трат</div>`;
  }
  const pct = Math.round(s.completionRatio * 100);
  const barWidth = Math.min(pct, 100);
  const overBudget = s.completionRatio > 1;
  return `
    <div class="plan-fact-indicator">
      <div class="progress-track">
        <div class="progress-fill ${overBudget ? 'over' : ''}" style="width:${barWidth}%"></div>
      </div>
      <div class="plan-fact-numbers">
        <span>${pct}% от плана потрачено</span>
        <span class="${s.deviation > 0 ? 'negative' : s.deviation < 0 ? 'positive' : ''}">${formatSignedCurrency(s.deviation)}</span>
      </div>
    </div>`;
}

function expenseRow(expense) {
  const badge = expense.status === ExpenseStatus.completed
    ? `<span class="status-pill completed">Состоялось</span>`
    : expense.status === ExpenseStatus.cancelled
      ? `<span class="status-pill cancelled">Отменено</span>`
      : expense.calendarEventAdded
        ? `<span class="status-pill planned">📅 в календаре</span>`
        : '';
  const amountClass = expense.status === ExpenseStatus.cancelled ? 'strike' : '';
  return `
    <li class="expense-row" data-id="${expense.id}">
      <button class="expense-row-main" data-action="edit-expense" data-id="${expense.id}">
        <span class="category-badge" style="background:${categoryTint(expense.category)}1a;color:${categoryTint(expense.category)}">${categoryIcon(expense.category)}</span>
        <span class="expense-row-info">
          <span class="expense-title">${escapeHtml(expense.title)}</span>
          <span class="expense-meta">${categoryTitle(expense.category)} · ${expense.plannedDate}</span>
        </span>
        <span class="expense-row-amount ${amountClass}">${formatCurrency(expense.plannedAmount)}</span>
      </button>
      <div class="expense-row-tags">
        ${badge}
        ${expense.status === ExpenseStatus.planned ? `<button class="link-btn" data-action="reconcile-expense" data-id="${expense.id}">Отметить</button>` : ''}
        <button class="link-btn danger" data-action="delete-expense" data-id="${expense.id}">Удалить</button>
      </div>
    </li>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function render(container, { uiState, setUiState }) {
  const weekExpenses = expenseStore.all().filter((e) => isWithinWeek(fromISODate(e.plannedDate), uiState.weekStart));
  const sorted = sortExpenses(weekExpenses, uiState.sortOption);
  const s = summary(weekExpenses);

  container.innerHTML = `
    <header class="week-header card">
      <div class="week-nav">
        <button class="icon-btn" data-action="prev-week" aria-label="Предыдущая неделя">‹</button>
        <div class="week-title">${formatWeekRange(uiState.weekStart)}</div>
        <button class="icon-btn" data-action="next-week" aria-label="Следующая неделя">›</button>
      </div>
      <div class="week-total">${formatCurrency(s.plannedTotal)}</div>
      ${planFactIndicator(s)}
    </header>

    <div class="toolbar">
      <select class="sort-select" data-action="change-sort">
        ${Object.values(ExpenseSortOption).map((opt) => `<option value="${opt}" ${opt === uiState.sortOption ? 'selected' : ''}>${sortOptionTitle(opt)}</option>`).join('')}
      </select>
      <button class="icon-btn" data-action="open-settings" aria-label="Настройки">⚙️</button>
    </div>

    ${sorted.length === 0
      ? `<div class="empty-state"><p>На этой неделе пока нет трат.</p><p class="muted">Нажмите «+», чтобы добавить первую.</p></div>`
      : `<ul class="expense-list">${sorted.map(expenseRow).join('')}</ul>`}

    <button class="fab" data-action="add-expense" aria-label="Добавить трату">+</button>
  `;

  container.querySelector('[data-action="prev-week"]').addEventListener('click', () => {
    setUiState({ weekStart: addWeeks(uiState.weekStart, -1) });
  });
  container.querySelector('[data-action="next-week"]').addEventListener('click', () => {
    setUiState({ weekStart: addWeeks(uiState.weekStart, 1) });
  });
  container.querySelector('[data-action="change-sort"]').addEventListener('change', (e) => {
    setUiState({ sortOption: e.target.value });
  });
  container.querySelector('[data-action="open-settings"]').addEventListener('click', () => {
    setUiState({ tab: 'settings' });
  });
  container.querySelector('[data-action="add-expense"]').addEventListener('click', () => {
    openExpenseForm({ weekStart: uiState.weekStart });
  });
  container.querySelectorAll('[data-action="edit-expense"]').forEach((btn) => {
    btn.addEventListener('click', () => openExpenseForm({ expense: expenseStore.byId(btn.dataset.id) }));
  });
  container.querySelectorAll('[data-action="reconcile-expense"]').forEach((btn) => {
    btn.addEventListener('click', () => openReconcileSheet(expenseStore.byId(btn.dataset.id)));
  });
  container.querySelectorAll('[data-action="delete-expense"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm('Удалить трату?')) expenseStore.remove(btn.dataset.id);
    });
  });
}
