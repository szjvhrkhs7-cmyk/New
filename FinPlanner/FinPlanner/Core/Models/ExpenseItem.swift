import Foundation
import SwiftData

/// A single planned (and later reconciled) expense.
///
/// `plannedDate` always carries a concrete calendar day — the app does not
/// support "sometime this week" entries, since every expense maps 1:1 to an
/// EventKit event once it has a date. `eventIdentifier` stores the
/// `EKEvent.eventIdentifier` so the calendar sync service can find the
/// matching event without scanning the whole calendar.
@Model
final class ExpenseItem {
    var id: UUID
    var title: String
    var plannedAmount: Decimal
    var actualAmount: Decimal?
    var categoryRaw: String
    var plannedDate: Date
    var note: String
    var statusRaw: String
    var eventIdentifier: String?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        plannedAmount: Decimal,
        category: ExpenseCategory,
        plannedDate: Date,
        note: String = "",
        status: ExpenseStatus = .planned,
        actualAmount: Decimal? = nil,
        eventIdentifier: String? = nil,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.plannedAmount = plannedAmount
        self.actualAmount = actualAmount
        self.categoryRaw = category.rawValue
        self.plannedDate = plannedDate
        self.note = note
        self.statusRaw = status.rawValue
        self.eventIdentifier = eventIdentifier
        self.createdAt = createdAt
    }

    var category: ExpenseCategory {
        get { ExpenseCategory(rawValue: categoryRaw) ?? .other }
        set { categoryRaw = newValue.rawValue }
    }

    var status: ExpenseStatus {
        get { ExpenseStatus(rawValue: statusRaw) ?? .planned }
        set { statusRaw = newValue.rawValue }
    }

    /// The amount to use for reporting: the actual amount once reconciled,
    /// otherwise the planned amount. Cancelled expenses contribute zero.
    var effectiveAmount: Decimal {
        switch status {
        case .planned: return plannedAmount
        case .completed: return actualAmount ?? plannedAmount
        case .cancelled: return 0
        }
    }

    /// Difference between what actually happened and what was planned.
    /// Positive means overspending, negative means underspending.
    var deviation: Decimal {
        switch status {
        case .planned: return 0
        case .completed: return (actualAmount ?? plannedAmount) - plannedAmount
        case .cancelled: return -plannedAmount
        }
    }
}
