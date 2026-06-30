import EventKit
import Foundation

/// Real EventKit-backed implementation of `CalendarSyncing`.
///
/// All planner events live in a single dedicated calendar ("Финансовый
/// планировщик") rather than the user's default calendar, so the app's
/// events are easy to spot — and remove — without touching anything else on
/// the user's iPhone calendar.
@MainActor
final class EventKitCalendarSyncService: CalendarSyncing {
    private let store = EKEventStore()
    private let plannerCalendarName = "Финансовый планировщик"
    private let plannerCalendarIDDefaultsKey = "plannerCalendarIdentifier"

    private(set) var isAuthorized = false

    @discardableResult
    func requestAccess() async -> Bool {
        do {
            let granted: Bool
            if #available(iOS 17.0, *) {
                granted = try await store.requestFullAccessToEvents()
            } else {
                granted = try await store.requestAccess(to: .event)
            }
            isAuthorized = granted
            return granted
        } catch {
            isAuthorized = false
            return false
        }
    }

    func syncToCalendar(_ expense: ExpenseItem) async throws -> String {
        guard isAuthorized else { throw CalendarSyncError.notAuthorized }

        let event: EKEvent
        if let identifier = expense.eventIdentifier, let existing = store.event(withIdentifier: identifier) {
            event = existing
        } else {
            event = EKEvent(eventStore: store)
            event.calendar = try plannerCalendar()
        }

        event.title = "\(expense.title) — \(expense.plannedAmount.formattedCurrency())"
        event.notes = expense.note.isEmpty ? nil : expense.note
        event.isAllDay = true
        event.startDate = expense.plannedDate
        event.endDate = expense.plannedDate

        try store.save(event, span: .thisEvent)
        return event.eventIdentifier
    }

    func removeFromCalendar(_ expense: ExpenseItem) async {
        guard let identifier = expense.eventIdentifier,
              let event = store.event(withIdentifier: identifier) else { return }
        try? store.remove(event, span: .thisEvent)
    }

    func pullCalendarChanges(into expenses: [ExpenseItem]) async {
        guard isAuthorized else { return }
        for expense in expenses {
            guard let identifier = expense.eventIdentifier,
                  let event = store.event(withIdentifier: identifier) else { continue }

            CalendarChangeApplier.apply(eventStartDate: event.startDate, eventNotes: event.notes, to: expense)
        }
    }

    /// Finds (or lazily creates) the dedicated planner calendar in the first
    /// calendar source that supports local events.
    private func plannerCalendar() throws -> EKCalendar {
        if let savedID = UserDefaults.standard.string(forKey: plannerCalendarIDDefaultsKey),
           let calendar = store.calendar(withIdentifier: savedID) {
            return calendar
        }

        if let existing = store.calendars(for: .event).first(where: { $0.title == plannerCalendarName }) {
            UserDefaults.standard.set(existing.calendarIdentifier, forKey: plannerCalendarIDDefaultsKey)
            return existing
        }

        let calendar = EKCalendar(for: .event, eventStore: store)
        calendar.title = plannerCalendarName
        calendar.cgColor = ThemeCalendarColor.accent

        guard let source = store.defaultCalendarForNewEvents?.source
            ?? store.sources.first(where: { $0.sourceType == .local })
            ?? store.sources.first
        else {
            throw CalendarSyncError.noCalendarSource
        }
        calendar.source = source

        try store.saveCalendar(calendar, commit: true)
        UserDefaults.standard.set(calendar.calendarIdentifier, forKey: plannerCalendarIDDefaultsKey)
        return calendar
    }
}

enum CalendarSyncError: LocalizedError {
    case notAuthorized
    case noCalendarSource

    var errorDescription: String? {
        switch self {
        case .notAuthorized: return "Нет доступа к календарю"
        case .noCalendarSource: return "Не найден источник календарей на устройстве"
        }
    }
}

/// Small indirection so this file doesn't need to import SwiftUI just for one color.
private enum ThemeCalendarColor {
    static var accent: CGColor {
        CGColor(red: 0x5A / 255, green: 0xC8 / 255, blue: 0xFA / 255, alpha: 1)
    }
}
