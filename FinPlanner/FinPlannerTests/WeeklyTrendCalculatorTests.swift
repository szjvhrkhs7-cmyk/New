import XCTest
@testable import FinPlanner

final class WeeklyTrendCalculatorTests: XCTestCase {
    private var calendar: Calendar = {
        var calendar = Calendar(identifier: .gregorian)
        calendar.firstWeekday = 2
        calendar.timeZone = TimeZone(identifier: "UTC")!
        return calendar
    }()

    private func date(_ year: Int, _ month: Int, _ day: Int) -> Date {
        calendar.date(from: DateComponents(year: year, month: month, day: day))!
    }

    func testExpensesAreBucketedIntoCorrectWeeks() {
        let weekOneExpense = ExpenseItem(title: "A", plannedAmount: 100, category: .other, plannedDate: date(2026, 6, 2))
        let weekTwoExpense = ExpenseItem(title: "B", plannedAmount: 200, category: .other, plannedDate: date(2026, 6, 9))

        let range = DateInterval(start: date(2026, 6, 1), end: date(2026, 6, 15))
        let trend = WeeklyTrendCalculator.weeklyTrend(
            for: [weekOneExpense, weekTwoExpense],
            in: range,
            calendar: calendar
        )

        XCTAssertEqual(trend.count, 2)
        XCTAssertEqual(trend[0].summary.plannedTotal, 100)
        XCTAssertEqual(trend[1].summary.plannedTotal, 200)
    }

    func testWeeksWithNoExpensesStillAppearWithZeroTotal() {
        let range = DateInterval(start: date(2026, 6, 1), end: date(2026, 6, 22))
        let trend = WeeklyTrendCalculator.weeklyTrend(for: [], in: range, calendar: calendar)

        XCTAssertEqual(trend.count, 3)
        XCTAssertTrue(trend.allSatisfy { $0.summary.plannedTotal == 0 })
    }
}
