import { expenseStore } from '../../state/store.js';
import { toISODate, fromISODate } from '../../core/week.js';
import { summary, categoryBreakdown } from '../../core/planFact.js';
import { makeCSV } from './csvExporter.js';
import { renderPrintReport, printReport } from './printReport.js';

const FORMAT = { csv: 'csv', pdf: 'pdf' };

function defaultRange() {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: toISODate(from), to: toISODate(today) };
}

export function render(container, { uiState, setUiState }) {
  const range = uiState.exportRange ?? { ...defaultRange(), format: FORMAT.csv };

  const expenses = expenseStore.all().filter((e) => e.plannedDate >= range.from && e.plannedDate <= range.to);

  container.innerHTML = `
    <section class="card">
      <h3>Период экспорта</h3>
      <div class="date-range">
        <label>С <input type="date" name="from" value="${range.from}" /></label>
        <label>По <input type="date" name="to" value="${range.to}" /></label>
      </div>
      <div class="segmented" data-action="format-picker">
        <button class="segmented-btn ${range.format === FORMAT.csv ? 'active' : ''}" data-format="${FORMAT.csv}">CSV</button>
        <button class="segmented-btn ${range.format === FORMAT.pdf ? 'active' : ''}" data-format="${FORMAT.pdf}">PDF</button>
      </div>
      <p class="muted">Найдено трат: ${expenses.length}</p>
      <button class="btn primary full-width" data-action="export">Поделиться файлом</button>
    </section>
  `;

  const fromInput = container.querySelector('input[name="from"]');
  const toInput = container.querySelector('input[name="to"]');
  fromInput.addEventListener('change', () => setUiState({ exportRange: { ...range, from: fromInput.value } }));
  toInput.addEventListener('change', () => setUiState({ exportRange: { ...range, to: toInput.value } }));
  container.querySelectorAll('[data-format]').forEach((btn) => {
    btn.addEventListener('click', () => setUiState({ exportRange: { ...range, format: btn.dataset.format } }));
  });

  container.querySelector('[data-action="export"]').addEventListener('click', async () => {
    const periodLabel = `${range.from} — ${range.to}`;
    if (range.format === FORMAT.csv) {
      await shareOrDownload(makeCSV(expenses), `finplanner_${range.from}_${range.to}.csv`, 'text/csv');
    } else {
      const s = summary(expenses);
      const breakdown = categoryBreakdown(expenses);
      renderPrintReport({ periodTitle: periodLabel, expenses, summary: s, breakdown });
      printReport();
    }
  });
}

async function shareOrDownload(content, filename, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  if (navigator.canShare && navigator.share) {
    const file = new File([blob], filename, { type: mime });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return;
      } catch {
        // user cancelled or share failed — fall back to download
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
