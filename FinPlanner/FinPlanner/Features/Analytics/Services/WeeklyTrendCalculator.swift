import Foundation

/// One week's worth of aggregated numbers, used to draw the "week vs week"
/// and "plan vs fact" charts on the analytics screen.
struct WeeklyTrendPoint: Identifiable {
    let week: WeekInterval
    let summary: PlanFactSummary

    var id: Date { week.start }
}

enum WeeklyTrendCalculator {
    /// Buckets `expenses` into the weeks (aligned to `calendar`) that
    /// overlap `range`, sorted oldest first so charts read left-to-right.
    static func weeklyTrend(
        for expenses: [ExpenseItem],
        in range: DateInterval,
        calendar: Calendar = .current
    ) -> [WeeklyTrendPoint] {
        var weeks: [WeekInterval] = []
        var cursor = WeekInterval(containing: range.start, calendar: calendar)
        while cursor.start < range.end {
            weeks.append(cursor)
            cursor = cursor.adding(weeks: 1)
        }

        return weeks.map { week in
            let weekExpenses = expenses.filter { week.contains($0.plannedDate) }
            return WeeklyTrendPoint(week: week, summary: PlanFactCalculator.summary(for: weekExpenses))
        }
    }
}
