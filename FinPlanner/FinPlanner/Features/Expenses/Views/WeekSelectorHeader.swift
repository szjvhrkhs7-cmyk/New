import SwiftUI
import SwiftData

/// Week navigation arrows plus the running total/plan-fact indicator for the
/// visible week. Swiping is handled by `WeekExpenseListView`'s parent via
/// the shared `week` binding so both stay in sync.
struct WeekSelectorHeader: View {
    @Binding var week: WeekInterval
    @Query private var weekExpenses: [ExpenseItem]

    init(week: Binding<WeekInterval>) {
        _week = week
        let start = week.wrappedValue.start
        let end = week.wrappedValue.end
        _weekExpenses = Query(filter: #Predicate<ExpenseItem> { item in
            item.plannedDate >= start && item.plannedDate < end
        })
    }

    private var summary: PlanFactSummary {
        PlanFactCalculator.summary(for: weekExpenses)
    }

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Button {
                    withAnimation { week = week.adding(weeks: -1) }
                } label: {
                    Image(systemName: "chevron.left.circle.fill")
                }

                Spacer()

                VStack(spacing: 2) {
                    Text(week.formattedRange())
                        .font(.headline)
                    if week.isCurrentWeek {
                        Text("Текущая неделя")
                            .font(.caption)
                            .foregroundStyle(Theme.textSecondary)
                    }
                }

                Spacer()

                Button {
                    withAnimation { week = week.adding(weeks: 1) }
                } label: {
                    Image(systemName: "chevron.right.circle.fill")
                }
            }
            .font(.title2)
            .foregroundStyle(Theme.accentStrong)
            .highPriorityGesture(
                DragGesture(minimumDistance: 30)
                    .onEnded { value in
                        withAnimation {
                            if value.translation.width < 0 {
                                week = week.adding(weeks: 1)
                            } else if value.translation.width > 0 {
                                week = week.adding(weeks: -1)
                            }
                        }
                    }
            )

            VStack(alignment: .leading, spacing: 8) {
                Text("Запланировано за неделю")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)
                Text(summary.plannedTotal.formattedCurrency())
                    .font(.system(size: 34, weight: .bold, design: .rounded))

                if let ratio = summary.completionRatio {
                    PlanFactIndicator(ratio: ratio, deviation: summary.deviation)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardStyle()
        }
    }
}

private struct PlanFactIndicator: View {
    let ratio: Double
    let deviation: Decimal

    private var clampedRatio: Double { min(max(ratio, 0), 1.5) }
    private var color: Color { deviation > 0 ? Theme.negative : Theme.positive }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.secondaryBackground)
                    Capsule()
                        .fill(color)
                        .frame(width: proxy.size.width * min(clampedRatio, 1))
                }
            }
            .frame(height: 8)

            Text("Факт: \(Int(ratio * 100))% от плана · \(deviation.formattedSignedCurrency())")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
        }
    }
}
