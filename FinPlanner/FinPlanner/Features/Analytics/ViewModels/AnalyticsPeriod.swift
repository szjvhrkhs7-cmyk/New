import Foundation

enum AnalyticsPeriod: String, CaseIterable, Identifiable {
    case month
    case quarter

    var id: String { rawValue }

    var title: String {
        switch self {
        case .month: return "Месяц"
        case .quarter: return "Квартал"
        }
    }

    private var component: Calendar.Component {
        switch self {
        case .month: return .month
        case .quarter: return .quarter
        }
    }

    /// The date range for the period containing `date`. `Calendar` doesn't
    /// expose `.quarter` directly in `dateInterval(of:for:)` on all OS
    /// versions, so quarters are computed manually from the month.
    func dateRange(containing date: Date, calendar: Calendar = .current) -> DateInterval {
        switch self {
        case .month:
            return calendar.dateInterval(of: .month, for: date)
                ?? DateInterval(start: date, duration: 30 * 24 * 3600)
        case .quarter:
            let month = calendar.component(.month, from: date)
            let quarterStartMonth = ((month - 1) / 3) * 3 + 1
            var components = calendar.dateComponents([.year], from: date)
            components.month = quarterStartMonth
            components.day = 1
            let start = calendar.date(from: components) ?? date
            let end = calendar.date(byAdding: .month, value: 3, to: start) ?? date
            return DateInterval(start: start, end: end)
        }
    }
}
