import SwiftUI
import SwiftData

/// Top-level tab bar plus the periodic pull side of calendar two-way sync:
/// whenever the app returns to the foreground, any event the user edited
/// directly in the Calendar app is pulled back onto its `ExpenseItem`.
struct RootTabView: View {
    @Environment(\.calendarSyncService) private var calendarService
    @Environment(\.scenePhase) private var scenePhase
    @Query(filter: #Predicate<ExpenseItem> { $0.eventIdentifier != nil })
    private var syncedExpenses: [ExpenseItem]

    var body: some View {
        TabView {
            MainExpensesView()
                .tabItem { Label("Неделя", systemImage: "calendar") }

            AnalyticsView()
                .tabItem { Label("Аналитика", systemImage: "chart.bar.fill") }

            ExportView()
                .tabItem { Label("Экспорт", systemImage: "square.and.arrow.up") }
        }
        .tint(Theme.accentStrong)
        .onChange(of: scenePhase) { _, newPhase in
            guard newPhase == .active else { return }
            Task { await calendarService.pullCalendarChanges(into: syncedExpenses) }
        }
        .task {
            await calendarService.pullCalendarChanges(into: syncedExpenses)
        }
    }
}
