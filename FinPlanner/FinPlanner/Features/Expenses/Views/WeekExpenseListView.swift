import SwiftUI
import SwiftData

/// The flat (non-day-grouped) list of every expense planned for the visible
/// week — day-by-day breakdown lives in the system Calendar app instead, per
/// the product brief.
struct WeekExpenseListView: View {
    @Query private var expenses: [ExpenseItem]
    let sort: ExpenseSortOption
    let onDelete: (ExpenseItem) -> Void
    let onReconcile: (ExpenseItem, ExpenseStatus, Decimal?) -> Void

    @State private var reconcilingExpense: ExpenseItem?
    @State private var editingExpense: ExpenseItem?

    init(
        week: WeekInterval,
        sort: ExpenseSortOption,
        onDelete: @escaping (ExpenseItem) -> Void,
        onReconcile: @escaping (ExpenseItem, ExpenseStatus, Decimal?) -> Void
    ) {
        self.sort = sort
        self.onDelete = onDelete
        self.onReconcile = onReconcile
        let start = week.start
        let end = week.end
        _expenses = Query(
            filter: #Predicate<ExpenseItem> { item in
                item.plannedDate >= start && item.plannedDate < end
            },
            sort: \ExpenseItem.createdAt,
            order: .reverse
        )
    }

    private var sortedExpenses: [ExpenseItem] {
        sort.sort(expenses)
    }

    var body: some View {
        VStack(spacing: 12) {
            if expenses.isEmpty {
                ContentUnavailableView(
                    "Пока нет трат",
                    systemImage: "calendar.badge.plus",
                    description: Text("Добавьте первую планируемую трату на эту неделю")
                )
                .padding(.top, 40)
            } else {
                ForEach(sortedExpenses) { expense in
                    ExpenseRowView(expense: expense)
                        .contentShape(Rectangle())
                        .onTapGesture { editingExpense = expense }
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                onDelete(expense)
                            } label: {
                                Label("Удалить", systemImage: "trash")
                            }
                        }
                        .swipeActions(edge: .leading) {
                            if expense.status == .planned {
                                Button {
                                    reconcilingExpense = expense
                                } label: {
                                    Label("Отметить", systemImage: "checkmark.circle")
                                }
                                .tint(Theme.positive)
                            }
                        }
                }
            }
        }
        .sheet(item: $editingExpense) { expense in
            AddEditExpenseView(week: WeekInterval(containing: expense.plannedDate), editingExpense: expense)
        }
        .sheet(item: $reconcilingExpense) { expense in
            ReconcileExpenseSheet(expense: expense, onReconcile: onReconcile)
        }
    }
}
