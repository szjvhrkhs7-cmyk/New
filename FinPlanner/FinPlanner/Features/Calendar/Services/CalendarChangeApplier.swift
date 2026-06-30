import Foundation

/// Pure logic for the "pull" side of two-way calendar sync, factored out of
/// `EventKitCalendarSyncService` so it can be unit tested without spinning up
/// a real `EKEventStore`.
enum CalendarChangeApplier {
    /// Applies the current state of a calendar event back onto its linked
    /// expense, returning whether anything changed.
    @discardableResult
    static func apply(
        eventStartDate: Date,
        eventNotes: String?,
        to expense: ExpenseItem,
        calendar: Calendar = .current
    ) -> Bool {
        var didChange = false

        if !calendar.isDate(eventStartDate, inSameDayAs: expense.plannedDate) {
            expense.plannedDate = eventStartDate
            didChange = true
        }

        let normalizedNotes = eventNotes ?? ""
        if normalizedNotes != expense.note {
            expense.note = normalizedNotes
            didChange = true
        }

        return didChange
    }
}
