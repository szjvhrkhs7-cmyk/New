const formatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatCurrency(amount) {
  return formatter.format(amount);
}

export function formatSignedCurrency(amount) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${formatter.format(Math.abs(amount))}`;
}

export function parseAmountInput(text) {
  const normalized = String(text).trim().replace(',', '.').replace(/\s+/g, '');
  if (normalized === '') return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
