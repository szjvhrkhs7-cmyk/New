import SwiftUI
import SwiftData

struct AnalyticsView: View {
    @State private var period: AnalyticsPeriod = .month
    @State private var anchorDate: Date = .now

    @Query private var allExpenses: [ExpenseItem]

    private var range: DateInterval {
        period.dateRange(containing: anchorDate)
    }

    private var periodExpenses: [ExpenseItem] {
        allExpenses.filter { range.contains($0.plannedDate) }
    }

    private var categoryBreakdown: [CategoryAmount] {
        PlanFactCalculator.categoryBreakdown(for: periodExpenses)
    }

    private var weeklyTrend: [WeeklyTrendPoint] {
        WeeklyTrendCalculator.weeklyTrend(for: periodExpenses, in: range)
    }

    private var summary: PlanFactSummary {
        PlanFactCalculator.summary(for: periodExpenses)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.sectionSpacing) {
                    Picker("Период", selection: $period) {
                        ForEach(AnalyticsPeriod.allCases) { period in
                            Text(period.title).tag(period)
                        }
                    }
                    .pickerStyle(.segmented)

                    SummaryCard(summary: summary)

                    if categoryBreakdown.isEmpty {
                        ContentUnavailableView(
                            "Нет данных",
                            systemImage: "chart.pie",
                            description: Text("За выбранный период ещё нет трат")
                        )
                        .padding(.top, 24)
                    } else {
                        CategoryBreakdownChart(data: categoryBreakdown)
                        WeeklyTrendChart(points: weeklyTrend)
                        PlanVsFactChart(points: weeklyTrend)
                    }
                }
                .padding()
            }
            .background(Theme.background)
            .navigationTitle("Аналитика")
        }
        .tint(Theme.accentStrong)
    }
}

private struct SummaryCard: View {
    let summary: PlanFactSummary

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Потрачено")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                Text(summary.actualTotal.formattedCurrency())
                    .font(.title2.bold())
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text("Отклонение от плана")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                Text(summary.deviation.formattedSignedCurrency())
                    .font(.title2.bold())
                    .foregroundStyle(summary.deviation > 0 ? Theme.negative : Theme.positive)
            }
        }
        .cardStyle()
    }
}

#Preview {
    AnalyticsView()
        .modelContainer(PersistenceController.makeContainer(inMemory: true))
}
