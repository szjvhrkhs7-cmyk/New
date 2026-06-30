import { categoryTitle } from './expenseCategory.js';

export const ExpenseSortOption = Object.freeze({
  dateAdded: 'dateAdded',
  amount: 'amount',
  category: 'category',
});

const TITLES = {
  [ExpenseSortOption.dateAdded]: 'По дате добавления',
  [ExpenseSortOption.amount]: 'По сумме',
  [ExpenseSortOption.category]: 'По категории',
};

export function sortOptionTitle(option) {
  return TITLES[option];
}

export function sortExpenses(expenses, option) {
  const list = [...expenses];
  switch (option) {
    case ExpenseSortOption.amount:
      return list.sort((a, b) => b.plannedAmount - a.plannedAmount);
    case ExpenseSortOption.category:
      return list.sort((a, b) => categoryTitle(a.category).localeCompare(categoryTitle(b.category), 'ru'));
    default:
      return list.sort((a, b) => b.createdAt - a.createdAt);
  }
}
