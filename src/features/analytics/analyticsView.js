import { expenseStore } from '../../state/store.js';
import { AnalyticsPeriod, periodRange, periodTitle } from './period.js';
import { weeklyTrend } from './weeklyTrend.js';
import { summary, categoryBreakdown } from '../../core/planFact.js';
import { formatCurrency, formatSignedCurrency } from '../../core/currency.js';
import { categoryPieChart, weeklyTrendChart, planVsFactChart } from './charts.js';
import { fromISODate } from '../../core/week.js';

export function render(container, { uiState, setUiState }) {
  const range = periodRange(uiState.analyticsPeriod, new Date());
  const expensesInPeriod = expenseStore.all().filter((e) => {
    const d = fromISODate(e.plannedDate);
    return d.getTime() >= range.start.getTime() && d.getTime() < range.end.getTime();
  });
  const s = summary(expensesInPeriod);
  const breakdown = categoryBreakdown(expensesInPeriod);
  const trendPoints = weeklyTrend(expensesInPeriod, range);

  container.innerHTML = `
    <header class="card analytics-header">
      <div class="segmented" data-action="period-picker">
        ${Object.values(AnalyticsPeriod).map((p) => `<button class="segmented-btn ${p === uiState.analyticsPeriod ? 'active' : ''}" data-period="${p}">${p === AnalyticsPeriod.month ? 'Месяц' : 'Квартал'}</button>`).join('')}
      </div>
      <div class="period-title">${periodTitle(uiState.analyticsPeriod, new Date())}</div>
    </header>

    ${expensesInPeriod.length === 0 ? `<div class="empty-state"><p>Нет трат за этот период.</p></div>` : `
      <section class="card">
        <div class="summary-grid">
          <div><span class="muted">Факт</span><strong>${formatCurrency(s.actualTotal)}</strong></div>
          <div><span class="muted">План</span><strong>${formatCurrency(s.plannedTotal)}</strong></div>
          <div><span class="muted">Отклонение</span><strong class="${s.deviation > 0 ? 'negative' : 'positive'}">${formatSignedCurrency(s.deviation)}</strong></div>
        </div>
      </section>

      <section class="card">
        <h3>По категориям</h3>
        ${categoryPieChart(breakdown)}
      </section>

      <section class="card">
        <h3>Динамика по неделям</h3>
        ${weeklyTrendChart(trendPoints)}
      </section>

      <section class="card">
        <h3>План vs факт</h3>
        ${planVsFactChart(trendPoints)}
      </section>
    `}
  `;

  container.querySelectorAll('[data-period]').forEach((btn) => {
    btn.addEventListener('click', () => setUiState({ analyticsPeriod: btn.dataset.period }));
  });
}
