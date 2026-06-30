import SwiftUI

private struct CalendarSyncServiceKey: EnvironmentKey {
    @MainActor static var defaultValue: any CalendarSyncing = PreviewCalendarSyncService()
}

extension EnvironmentValues {
    var calendarSyncService: any CalendarSyncing {
        get { self[CalendarSyncServiceKey.self] }
        set { self[CalendarSyncServiceKey.self] = newValue }
    }
}

/// No-op stand-in used by SwiftUI previews, unit tests, and as the
/// environment default so call sites never have to unwrap an optional.
@MainActor
final class PreviewCalendarSyncService: CalendarSyncing {
    var isAuthorized = false

    func requestAccess() async -> Bool { false }

    func syncToCalendar(_ expense: ExpenseItem) async throws -> String {
        expense.eventIdentifier ?? UUID().uuidString
    }

    func removeFromCalendar(_ expense: ExpenseItem) async {}

    func pullCalendarChanges(into expenses: [ExpenseItem]) async {}
}
