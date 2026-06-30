import SwiftUI
import SwiftData

struct MainExpensesView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.calendarSyncService) private var calendarService

    @State private var currentWeek = WeekInterval(containing: .now)
    @State private var sortOption: ExpenseSortOption = .dateAdded
    @State private var isPresentingAddExpense = false
    @State private var isPresentingSettings = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.sectionSpacing) {
                    WeekSelectorHeader(week: $currentWeek)
                        .padding(.horizontal)

                    WeekExpenseListView(
                        week: currentWeek,
                        sort: sortOption,
                        onDelete: delete,
                        onReconcile: reconcile
                    )
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Theme.background)
            .navigationTitle("Эта неделя")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Menu {
                        Picker("Сортировка", selection: $sortOption) {
                            ForEach(ExpenseSortOption.allCases) { option in
                                Text(option.title).tag(option)
                            }
                        }
                    } label: {
                        Image(systemName: "arrow.up.arrow.down.circle")
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isPresentingSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isPresentingAddExpense = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .sheet(isPresented: $isPresentingAddExpense) {
                AddEditExpenseView(week: currentWeek)
            }
            .sheet(isPresented: $isPresentingSettings) {
                SettingsView()
            }
            .task {
                await calendarService.requestAccess()
            }
        }
        .tint(Theme.accentStrong)
    }

    private func delete(_ expense: ExpenseItem) {
        Task { await calendarService.removeFromCalendar(expense) }
        modelContext.delete(expense)
    }

    private func reconcile(_ expense: ExpenseItem, status: ExpenseStatus, actualAmount: Decimal?) {
        expense.status = status
        expense.actualAmount = actualAmount
    }
}

#Preview {
    MainExpensesView()
        .modelContainer(PersistenceController.makeContainer(inMemory: true))
        .environment(\.calendarSyncService, PreviewCalendarSyncService())
}
