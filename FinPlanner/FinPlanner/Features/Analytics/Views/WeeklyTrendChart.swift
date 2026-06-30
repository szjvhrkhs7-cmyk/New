import SwiftUI
import Charts

/// Bar chart comparing total spend week over week, so the user can see
/// growth or decline at a glance.
struct WeeklyTrendChart: View {
    let points: [WeeklyTrendPoint]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Динамика по неделям")
                .font(.headline)

            Chart(points) { point in
                BarMark(
                    x: .value("Неделя", point.week.start, unit: .weekOfYear),
                    y: .value("Сумма", NSDecimalNumber(decimal: point.summary.actualTotal).doubleValue)
                )
                .foregroundStyle(Theme.accent)
                .cornerRadius(6)
            }
            .frame(height: 180)
            .chartXAxis {
                AxisMarks(values: .stride(by: .weekOfYear)) { _ in
                    AxisGridLine()
                    AxisTick()
                }
            }
        }
        .cardStyle()
    }
}
