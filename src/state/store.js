const EXPENSES_KEY = 'finplanner.expenses.v1';
const SETTINGS_KEY = 'finplanner.settings.v1';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

class ExpenseStore {
  constructor() {
    this.expenses = readJSON(EXPENSES_KEY, []);
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) listener(this.expenses);
  }

  persist() {
    writeJSON(EXPENSES_KEY, this.expenses);
    this.notify();
  }

  all() {
    return this.expenses;
  }

  add(expense) {
    this.expenses.push(expense);
    this.persist();
    return expense;
  }

  update(id, patch) {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;
    this.expenses[index] = { ...this.expenses[index], ...patch };
    this.persist();
    return this.expenses[index];
  }

  remove(id) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
    this.persist();
  }

  byId(id) {
    return this.expenses.find((e) => e.id === id) ?? null;
  }
}

export const expenseStore = new ExpenseStore();

export const settingsStore = {
  get() {
    return readJSON(SETTINGS_KEY, { appLockEnabled: false });
  },
  set(patch) {
    const next = { ...this.get(), ...patch };
    writeJSON(SETTINGS_KEY, next);
    return next;
  },
};
