import { expenseStore, settingsStore } from './state/store.js';
import { startOfWeek } from './core/week.js';
import { ExpenseSortOption } from './core/sort.js';
import { AnalyticsPeriod } from './features/analytics/period.js';
import * as expensesView from './features/expenses/expensesView.js';
import * as analyticsView from './features/analytics/analyticsView.js';
import * as exportView from './features/export/exportView.js';
import * as settingsView from './features/settings/settingsView.js';
import * as lock from './features/security/webauthnLock.js';
import { showLockScreen } from './features/security/lockScreen.js';

const uiState = {
  tab: 'expenses',
  weekStart: startOfWeek(new Date()),
  sortOption: ExpenseSortOption.dateAdded,
  analyticsPeriod: AnalyticsPeriod.month,
  exportRange: null,
};

const content = document.getElementById('app-content');
const tabBar = document.getElementById('tab-bar');

const TABS = [
  { id: 'expenses', label: 'Неделя', icon: '📅' },
  { id: 'analytics', label: 'Аналитика', icon: '📊' },
  { id: 'export', label: 'Экспорт', icon: '📤' },
];

function setUiState(patch) {
  Object.assign(uiState, patch);
  render();
}

function renderTabBar() {
  if (uiState.tab === 'settings') {
    tabBar.hidden = true;
    return;
  }
  tabBar.hidden = false;
  tabBar.innerHTML = TABS.map((t) => `
    <button class="tab-btn ${t.id === uiState.tab ? 'active' : ''}" data-tab="${t.id}">
      <span class="tab-icon">${t.icon}</span>
      <span class="tab-label">${t.label}</span>
    </button>`).join('');
  tabBar.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => setUiState({ tab: btn.dataset.tab }));
  });
}

function render() {
  renderTabBar();
  const ctx = { uiState, setUiState };
  switch (uiState.tab) {
    case 'analytics':
      analyticsView.render(content, ctx);
      break;
    case 'export':
      exportView.render(content, ctx);
      break;
    case 'settings':
      settingsView.render(content, ctx);
      break;
    default:
      expensesView.render(content, ctx);
  }
}

expenseStore.subscribe(render);
render();

if (settingsStore.get().appLockEnabled && lock.hasRegisteredCredential()) {
  content.style.visibility = 'hidden';
  tabBar.style.visibility = 'hidden';
  showLockScreen(() => {
    content.style.visibility = '';
    tabBar.style.visibility = '';
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
