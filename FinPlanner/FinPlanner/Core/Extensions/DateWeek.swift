import Foundation

/// A concrete Monday/Sunday-style week, aligned to whatever first weekday the
/// user's system `Calendar` (and therefore the iPhone Calendar app) uses.
/// All week math in the app goes through this type so the in-app week
/// selector always matches what EventKit shows.
struct WeekInterval: Equatable, Hashable {
    let calendar: Calendar
    let start: Date
    let end: Date

    /// The week that contains `date`, using `calendar`'s `firstWeekday`.
    init(containing date: Date, calendar: Calendar = .current) {
        self.calendar = calendar
        let interval = calendar.dateInterval(of: .weekOfYear, for: date)
            ?? DateInterval(start: date, duration: 7 * 24 * 3600)
        self.start = interval.start
        // `dateInterval(of:for:)` end is exclusive (midnight of the next week);
        // keep it that way and let call sites treat `end` as exclusive too.
        self.end = interval.end
    }

    private init(calendar: Calendar, start: Date, end: Date) {
        self.calendar = calendar
        self.start = start
        self.end = end
    }

    func contains(_ date: Date) -> Bool {
        date >= start && date < end
    }

    func adding(weeks: Int) -> WeekInterval {
        guard let shifted = calendar.date(byAdding: .weekOfYear, value: weeks, to: start) else {
            return self
        }
        return WeekInterval(containing: shifted, calendar: calendar)
    }

    /// All seven calendar days in the week, in order, for day-by-day breakdowns.
    var days: [Date] {
        (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }

    /// Range usable directly in a SwiftData `#Predicate`.
    var dateRange: Range<Date> { start..<end }

    var isCurrentWeek: Bool {
        WeekInterval(containing: .now, calendar: calendar) == self
    }

    /// Localized "9–15 июня" style label.
    func formattedRange(locale: Locale = .current) -> String {
        let lastDay = calendar.date(byAdding: .day, value: -1, to: end) ?? end
        let sameMonth = calendar.component(.month, from: start) == calendar.component(.month, from: lastDay)

        let dayMonthFormatter = DateFormatter()
        dayMonthFormatter.locale = locale
        dayMonthFormatter.setLocalizedDateFormatFromTemplate("d MMMM")

        let dayOnlyFormatter = DateFormatter()
        dayOnlyFormatter.locale = locale
        dayOnlyFormatter.setLocalizedDateFormatFromTemplate("d")

        if sameMonth {
            return "\(dayOnlyFormatter.string(from: start))–\(dayMonthFormatter.string(from: lastDay))"
        } else {
            return "\(dayMonthFormatter.string(from: start)) – \(dayMonthFormatter.string(from: lastDay))"
        }
    }
}
