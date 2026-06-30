export const ExpenseCategory = Object.freeze({
  groceries: 'groceries',
  transport: 'transport',
  housing: 'housing',
  entertainment: 'entertainment',
  health: 'health',
  shopping: 'shopping',
  education: 'education',
  subscriptions: 'subscriptions',
  other: 'other',
});

export const ALL_CATEGORIES = Object.values(ExpenseCategory);

const META = {
  [ExpenseCategory.groceries]: { title: 'Продукты', icon: '🛒', tint: '#34C759' },
  [ExpenseCategory.transport]: { title: 'Транспорт', icon: '🚌', tint: '#0A84FF' },
  [ExpenseCategory.housing]: { title: 'Жильё', icon: '🏠', tint: '#FF9F0A' },
  [ExpenseCategory.entertainment]: { title: 'Развлечения', icon: '🎬', tint: '#BF5AF2' },
  [ExpenseCategory.health]: { title: 'Здоровье', icon: '💊', tint: '#FF375F' },
  [ExpenseCategory.shopping]: { title: 'Покупки', icon: '🛍️', tint: '#5AC8FA' },
  [ExpenseCategory.education]: { title: 'Образование', icon: '📚', tint: '#FFD60A' },
  [ExpenseCategory.subscriptions]: { title: 'Подписки', icon: '🔁', tint: '#64D2FF' },
  [ExpenseCategory.other]: { title: 'Другое', icon: '✨', tint: '#8E8E93' },
};

export function categoryTitle(category) {
  return META[category]?.title ?? META[ExpenseCategory.other].title;
}

export function categoryIcon(category) {
  return META[category]?.icon ?? META[ExpenseCategory.other].icon;
}

export function categoryTint(category) {
  return META[category]?.tint ?? META[ExpenseCategory.other].tint;
}
