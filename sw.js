const CACHE_NAME = 'finplanner-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/styles.css',
  './src/app.js',
  './src/core/currency.js',
  './src/core/expense.js',
  './src/core/expenseCategory.js',
  './src/core/expenseStatus.js',
  './src/core/modal.js',
  './src/core/planFact.js',
  './src/core/sort.js',
  './src/core/week.js',
  './src/features/analytics/analyticsView.js',
  './src/features/analytics/charts.js',
  './src/features/analytics/period.js',
  './src/features/analytics/weeklyTrend.js',
  './src/features/calendar/calendarDownload.js',
  './src/features/calendar/icsExporter.js',
  './src/features/expenses/expenseForm.js',
  './src/features/expenses/expensesView.js',
  './src/features/expenses/reconcileSheet.js',
  './src/features/export/csvExporter.js',
  './src/features/export/exportView.js',
  './src/features/export/printReport.js',
  './src/features/security/lockScreen.js',
  './src/features/security/webauthnLock.js',
  './src/features/settings/settingsView.js',
  './src/state/store.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
