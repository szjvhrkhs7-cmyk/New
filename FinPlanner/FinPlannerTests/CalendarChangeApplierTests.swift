import XCTest
@testable import FinPlanner

final class CalendarChangeApplierTests: XCTestCase {
    func testEventDateChangeUpdatesPlannedDate() {
        let calendar = Calendar(identifier: .gregorian)
        let originalDate = calendar.date(from: DateComponents(year: 2026, month: 6, day: 10))!
        let newDate = calendar.date(from: DateComponents(year: 2026, month: 6, day: 12))!

        let expense = ExpenseItem(title: "Аренда", plannedAmount: 1000, category: .housing, plannedDate: originalDate)

        let changed = CalendarChangeApplier.apply(eventStartDate: newDate, eventNotes: nil, to: expense, calendar: calendar)

        XCTAssertTrue(changed)
        XCTAssertTrue(calendar.isDate(expense.plannedDate, inSameDayAs: newDate))
    }

    func testSameDayEventDateDoesNotMarkAsChanged() {
        let calendar = Calendar(identifier: .gregorian)
        let date = calendar.date(from: DateComponents(year: 2026, month: 6, day: 10, hour: 9))!
        let sameDayLater = calendar.date(from: DateComponents(year: 2026, month: 6, day: 10, hour: 18))!

        let expense = ExpenseItem(title: "Аренда", plannedAmount: 1000, category: .housing, plannedDate: date)

        let changed = CalendarChangeApplier.apply(eventStartDate: sameDayLater, eventNotes: "", to: expense, calendar: calendar)

        XCTAssertFalse(changed)
    }

    func testEventNotesSyncBackToExpenseNote() {
        let expense = ExpenseItem(title: "Подарок", plannedAmount: 1500, category: .other, plannedDate: .now, note: "")

        let changed = CalendarChangeApplier.apply(eventStartDate: expense.plannedDate, eventNotes: "Купить открытку", to: expense)

        XCTAssertTrue(changed)
        XCTAssertEqual(expense.note, "Купить открытку")
    }

    func testNilEventNotesClearsExistingNote() {
        let expense = ExpenseItem(title: "Подарок", plannedAmount: 1500, category: .other, plannedDate: .now, note: "Старая заметка")

        let changed = CalendarChangeApplier.apply(eventStartDate: expense.plannedDate, eventNotes: nil, to: expense)

        XCTAssertTrue(changed)
        XCTAssertEqual(expense.note, "")
    }
}
