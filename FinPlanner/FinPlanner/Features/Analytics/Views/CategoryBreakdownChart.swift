import SwiftUI
import Charts

/// Pie chart of spend by category for the selected period.
struct CategoryBreakdownChart: View {
    let data: [CategoryAmount]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("По категориям")
                .font(.headline)

            Chart(data) { item in
                SectorMark(
                    angle: .value("Сумма", NSDecimalNumber(decimal: item.amount).doubleValue),
                    innerRadius: .ratio(0.6),
                    angularInset: 1.5
                )
                .foregroundStyle(item.category.tint)
                .cornerRadius(4)
            }
            .frame(height: 220)

            CategoryLegend(data: data)
        }
        .cardStyle()
    }
}

private struct CategoryLegend: View {
    let data: [CategoryAmount]

    private var total: Decimal { data.reduce(0) { $0 + $1.amount } }

    var body: some View {
        VStack(spacing: 8) {
            ForEach(data) { item in
                HStack {
                    Circle()
                        .fill(item.category.tint)
                        .frame(width: 8, height: 8)
                    Text(item.category.title)
                        .font(.subheadline)
                    Spacer()
                    Text(item.amount.formattedCurrency())
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
    }
}
