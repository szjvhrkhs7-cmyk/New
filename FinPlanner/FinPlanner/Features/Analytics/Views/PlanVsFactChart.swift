import SwiftUI
import Charts

/// Grouped bar chart of plan vs. actual per week, the visual answer to
/// "how accurately do I budget?".
struct PlanVsFactChart: View {
    let points: [WeeklyTrendPoint]

    private struct Bar: Identifiable {
        let weekStart: Date
        let series: String
        let amount: Double
        var id: String { "\(weekStart)-\(series)" }
    }

    private var bars: [Bar] {
        points.flatMap { point in
            [
                Bar(weekStart: point.week.start, series: "План", amount: NSDecimalNumber(decimal: point.summary.plannedTotal).doubleValue),
                Bar(weekStart: point.week.start, series: "Факт", amount: NSDecimalNumber(decimal: point.summary.actualTotal).doubleValue)
            ]
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("План / факт по неделям")
                .font(.headline)

            Chart(bars) { bar in
                BarMark(
                    x: .value("Неделя", bar.weekStart, unit: .weekOfYear),
                    y: .value("Сумма", bar.amount)
                )
                .position(by: .value("Тип", bar.series))
                .foregroundStyle(by: .value("Тип", bar.series))
                .cornerRadius(6)
            }
            .chartForegroundStyleScale([
                "План": Theme.textSecondary.opacity(0.4),
                "Факт": Theme.accentStrong
            ])
            .frame(height: 180)
        }
        .cardStyle()
    }
}
