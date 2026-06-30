import XCTest
@testable import FinPlanner

final class WeekIntervalTests: XCTestCase {
    private func mondayFirstCalendar() -> Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.firstWeekday = 2 // Monday
        calendar.timeZone = TimeZone(identifier: "UTC")!
        return calendar
    }

    private func date(_ year: Int, _ month: Int, _ day: Int, calendar: Calendar) -> Date {
        calendar.date(from: DateComponents(year: year, month: month, day: day))!
    }

    func testWeekContainsAllSevenDays() {
        let calendar = mondayFirstCalendar()
        // 2026-06-30 is a Tuesday.
        let week = WeekInterval(containing: date(2026, 6, 30, calendar: calendar), calendar: calendar)

        XCTAssertEqual(week.days.count, 7)
        XCTAssertTrue(week.contains(date(2026, 6, 30, calendar: calendar)))
        XCTAssertTrue(week.contains(date(2026, 6, 29, calendar: calendar)))
        XCTAssertFalse(week.contains(date(2026, 7, 6, calendar: calendar)))
    }

    func testAddingWeeksMovesByExactlySevenDays() {
        let calendar = mondayFirstCalendar()
        let week = WeekInterval(containing: date(2026, 6, 30, calendar: calendar), calendar: calendar)
        let nextWeek = week.adding(weeks: 1)
        let previousWeek = week.adding(weeks: -1)

        let sevenDays: TimeInterval = 7 * 24 * 3600
        XCTAssertEqual(nextWeek.start.timeIntervalSince(week.start), sevenDays)
        XCTAssertEqual(week.start.timeIntervalSince(previousWeek.start), sevenDays)
    }

    func testWeekBoundariesAreExclusiveAtTheEnd() {
        let calendar = mondayFirstCalendar()
        let week = WeekInterval(containing: date(2026, 6, 30, calendar: calendar), calendar: calendar)

        XCTAssertFalse(week.contains(week.end))
        XCTAssertTrue(week.contains(week.start))
    }
}
