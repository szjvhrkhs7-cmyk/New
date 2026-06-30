import { openModal } from '../../core/modal.js';
import { expenseStore } from '../../state/store.js';
import { ExpenseStatus } from '../../core/expenseStatus.js';
import { parseAmountInput } from '../../core/currency.js';

export function openReconcileSheet(expense) {
  openModal(`
    <h2>${escapeHtml(expense.title)}</h2>
    <p class="muted">Запланировано: ${expense.plannedAmount} ₽</p>
    <div class="reconcile-choice">
      <button class="btn primary" data-action="completed">Трата состоялась</button>
      <button class="btn danger-outline" data-action="cancelled">Трата не состоялась</button>
    </div>
    <form class="form" data-form="actual" hidden>
      <label>Фактическая сумма, ₽
        <input type="text" inputmode="decimal" name="actual" value="${expense.plannedAmount}" />
      </label>
      <div class="form-actions">
        <button type="button" class="btn ghost" data-action="back">Назад</button>
        <button type="submit" class="btn primary">Подтвердить</button>
      </div>
    </form>
  `, {
    onMount(sheet, close) {
      const choiceBlock = sheet.querySelector('.reconcile-choice');
      const form = sheet.querySelector('[data-form="actual"]');

      sheet.querySelector('[data-action="completed"]').addEventListener('click', () => {
        choiceBlock.hidden = true;
        form.hidden = false;
      });
      sheet.querySelector('[data-action="cancelled"]').addEventListener('click', () => {
        expenseStore.update(expense.id, { status: ExpenseStatus.cancelled, actualAmount: null });
        close();
      });
      sheet.querySelector('[data-action="back"]').addEventListener('click', () => {
        form.hidden = true;
        choiceBlock.hidden = false;
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const actual = parseAmountInput(new FormData(form).get('actual'));
        expenseStore.update(expense.id, {
          status: ExpenseStatus.completed,
          actualAmount: actual ?? expense.plannedAmount,
        });
        close();
      });
    },
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
