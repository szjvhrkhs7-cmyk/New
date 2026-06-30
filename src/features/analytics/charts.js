import { categoryTint, categoryTitle } from '../../core/expenseCategory.js';
import { formatCurrency } from '../../core/currency.js';
import { formatWeekRange } from '../../core/week.js';

export function categoryPieChart(breakdown) {
  const total = breakdown.reduce((sum, b) => sum + b.amount, 0);
  if (total === 0) {
    return `<div class="empty-state small">Нет данных за период</div>`;
  }
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const circles = breakdown.map(({ category, amount }) => {
    const dash = (amount / total) * c;
    const circle = `<circle r="${r}" cx="50" cy="50" fill="transparent" stroke="${categoryTint(category)}" stroke-width="16" stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 50 50)"></circle>`;
    offset += dash;
    return circle;
  }).join('');

  const legend = breakdown.map(({ category, amount }) => `
    <li class="legend-row">
      <span class="legend-dot" style="background:${categoryTint(category)}"></span>
      <span class="legend-title">${categoryTitle(category)}</span>
      <span class="legend-amount">${formatCurrency(amount)}</span>
      <span class="legend-pct muted">${Math.round((amount / total) * 100)}%</span>
    </li>`).join('');

  return `
    <div class="pie-wrap">
      <svg viewBox="0 0 100 100" class="pie-chart">${circles}</svg>
    </div>
    <ul class="legend-list">${legend}</ul>`;
}

export function weeklyTrendChart(points) {
  if (points.length === 0) return `<div class="empty-state small">Нет данных</div>`;
  const max = Math.max(1, ...points.map((p) => p.summary.actualTotal));
  const groupWidth = 100 / points.length;
  const bars = points.map((p, i) => {
    const h = (p.summary.actualTotal / max) * 78;
    const x = i * groupWidth + groupWidth * 0.2;
    const w = groupWidth * 0.6;
    return `<rect x="${x}" y="${82 - h}" width="${w}" height="${h}" rx="1.5" fill="#5AC8FA"></rect>`;
  }).join('');
  const labels = points.map((p, i) => `<span style="left:${(i + 0.5) * groupWidth}%">${formatWeekRange(p.weekStart).split(' ')[0]}</span>`).join('');
  return `
    <svg viewBox="0 0 100 90" preserveAspectRatio="none" class="bar-chart">${bars}</svg>
    <div class="bar-chart-labels">${labels}</div>`;
}

export function planVsFactChart(points) {
  if (points.length === 0) return `<div class="empty-state small">Нет данных</div>`;
  const max = Math.max(1, ...points.flatMap((p) => [p.summary.plannedTotal, p.summary.actualTotal]));
  const groupWidth = 100 / points.length;
  const bars = points.map((p, i) => {
    const gx = i * groupWidth;
    const plannedH = (p.summary.plannedTotal / max) * 78;
    const actualH = (p.summary.actualTotal / max) * 78;
    const barW = groupWidth * 0.32;
    const plannedX = gx + groupWidth * 0.12;
    const actualX = gx + groupWidth * 0.52;
    return `
      <rect x="${plannedX}" y="${82 - plannedH}" width="${barW}" height="${plannedH}" rx="1.5" fill="#C7C7CC"></rect>
      <rect x="${actualX}" y="${82 - actualH}" width="${barW}" height="${actualH}" rx="1.5" fill="#5AC8FA"></rect>`;
  }).join('');
  return `
    <svg viewBox="0 0 100 90" preserveAspectRatio="none" class="bar-chart">${bars}</svg>
    <div class="legend-row inline"><span class="legend-dot" style="background:#C7C7CC"></span>План <span class="legend-dot" style="background:#5AC8FA;margin-left:12px"></span>Факт</div>`;
}
