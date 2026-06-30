import { openModal } from '../../core/modal.js';
import { expenseStore } from '../../state/store.js';
import { makeExpense } from '../../core/expense.js';
import { ALL_CATEGORIES, categoryTitle } from '../../core/expenseCategory.js';
import { parseAmountInput } from '../../core/currency.js';
import { toISODate, fromISODate } from '../../core/week.js';
import { downloadICSForExpense } from '../calendar/calendarDownload.js';

export function openExpenseForm({ expense = null, weekStart = new Date() } = {}) {
  const isEdit = Boolean(expense);
  const initialDate = expense ? expense.plannedDate : toISODate(weekStart);

  openModal(`
    <h2>${isEdit ? 'Изменить трату' : 'Новая трата'}</h2>
    <form class="form" data-form="expense">
      <label>Название
        <input type="text" name="title" required maxlength="80" value="${expense ? escapeAttr(expense.title) : ''}" />
      </label>
      <label>Сумма, ₽
        <input type="text" inputmode="decimal" name="amount" required value="${expense ? expense.plannedAmount : ''}" />
      </label>
      <label>Категория
        <select name="category">
          ${ALL_CATEGORIES.map((c) => `<option value="${c}" ${expense?.category === c ? 'selected' : ''}>${categoryTitle(c)}</option>`).join('')}
        </select>
      </label>
      <label>Дата
        <input type="date" name="date" required value="${initialDate}" />
      </label>
      <label>Заметка
        <textarea name="note" rows="2" maxlength="280">${expense ? escapeAttr(expense.note) : ''}</textarea>
      </label>
      <p class="form-error" data-error hidden></p>
      <div class="form-actions">
        <button type="button" class="btn ghost" data-action="cancel">Отмена</button>
        <button type="submit" class="btn primary">Сохранить</button>
      </div>
    </form>
  `, {
    onMount(sheet, close) {
      sheet.querySelector('[data-action="cancel"]').addEventListener('click', close);
      sheet.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const title = String(formData.get('title')).trim();
        const amount = parseAmountInput(formData.get('amount'));
        const date = fromISODate(String(formData.get('date')));
        const category = String(formData.get('category'));
        const note = String(formData.get('note') ?? '');
        const errorEl = sheet.querySelector('[data-error]');

        if (!title) {
          errorEl.textContent = 'Укажите название траты.';
          errorEl.hidden = false;
          return;
        }
        if (amount === null) {
          errorEl.textContent = 'Введите корректную сумму.';
          errorEl.hidden = false;
          return;
        }

        let saved;
        if (isEdit) {
          saved = expenseStore.update(expense.id, {
            title, plannedAmount: amount, category, plannedDate: toISODate(date), note,
          });
        } else {
          saved = expenseStore.add(makeExpense({ title, plannedAmount: amount, category, plannedDate: date, note }));
        }
        downloadICSForExpense(saved);
        expenseStore.update(saved.id, { calendarEventAdded: true });
        close();
      });
    },
  });
}

function escapeAttr(value) {
  return String(value).replace(/"/g, '&quot;');
}
