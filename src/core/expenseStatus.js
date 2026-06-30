export const ExpenseStatus = Object.freeze({
  planned: 'planned',
  completed: 'completed',
  cancelled: 'cancelled',
});

const TITLES = {
  [ExpenseStatus.planned]: 'Запланировано',
  [ExpenseStatus.completed]: 'Состоялось',
  [ExpenseStatus.cancelled]: 'Отменено',
};

export function statusTitle(status) {
  return TITLES[status] ?? TITLES[ExpenseStatus.planned];
}
