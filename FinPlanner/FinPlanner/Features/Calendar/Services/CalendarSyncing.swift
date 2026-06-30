import Foundation

/// Abstraction over EventKit so views and the expenses view model never talk
/// to `EKEventStore` directly — this keeps `AddEditExpenseView` testable and
/// lets the app run in SwiftUI previews / tests without calendar permission.
@MainActor
protocol CalendarSyncing {
    /// Current authorization state for full calendar access.
    var isAuthorized: Bool { get }

    /// Prompts the user for calendar access if not already determined.
    @discardableResult
    func requestAccess() async -> Bool

    /// Creates a new calendar event for the expense, or updates the existing
    /// one if `expense.eventIdentifier` is already set. Returns the event
    /// identifier to persist on the expense.
    func syncToCalendar(_ expense: ExpenseItem) async throws -> String

    /// Removes the linked calendar event, if any.
    func removeFromCalendar(_ expense: ExpenseItem) async

    /// Pulls the latest title/date/notes for events that were edited directly
    /// in the Calendar app back onto their linked `ExpenseItem`s.
    func pullCalendarChanges(into expenses: [ExpenseItem]) async
}
