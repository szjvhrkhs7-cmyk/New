import Foundation

/// Aggregate plan-vs-fact numbers for a set of expenses (a week, a month, a
/// category slice — anything that produces a `[ExpenseItem]`).
struct PlanFactSummary {
    let plannedTotal: Decimal
    let actualTotal: Decimal
    /// `actualTotal - plannedTotal`. Positive = overspent, negative = underspent.
    let deviation: Decimal
    /// 0...1+ ratio of actual to planned, used to drive the main-screen
    /// progress indicator. `nil` when nothing was planned yet.
    let completionRatio: Double?

    static let zero = PlanFactSummary(plannedTotal: 0, actualTotal: 0, deviation: 0, completionRatio: nil)
}

/// Amount spent within a single category, used by analytics charts.
struct CategoryAmount: Identifiable {
    let category: ExpenseCategory
    let amount: Decimal

    var id: String { category.rawValue }
}

enum PlanFactCalculator {
    /// Only `completed` and `cancelled` expenses count toward the "actual"
    /// total; still-`planned` items contribute their planned amount to the
    /// planned side only, keeping the indicator meaningful mid-week.
    static func summary(for expenses: [ExpenseItem]) -> PlanFactSummary {
        guard !expenses.isEmpty else { return .zero }

        let plannedTotal = expenses.reduce(Decimal(0)) { $0 + $1.plannedAmount }
        let actualTotal = expenses.reduce(Decimal(0)) { $0 + $1.effectiveAmount }
        let deviation = actualTotal - plannedTotal

        let reconciled = expenses.filter { $0.status != .planned }
        let reconciledPlanned = reconciled.reduce(Decimal(0)) { $0 + $1.plannedAmount }
        let reconciledActual = reconciled.reduce(Decimal(0)) { $0 + $1.effectiveAmount }

        let ratio: Double?
        if reconciledPlanned > 0 {
            ratio = NSDecimalNumber(decimal: reconciledActual)
                .dividing(by: NSDecimalNumber(decimal: reconciledPlanned))
                .doubleValue
        } else {
            ratio = nil
        }

        return PlanFactSummary(
            plannedTotal: plannedTotal,
            actualTotal: actualTotal,
            deviation: deviation,
            completionRatio: ratio
        )
    }

    static func categoryBreakdown(for expenses: [ExpenseItem], using amount: (ExpenseItem) -> Decimal = { $0.effectiveAmount }) -> [CategoryAmount] {
        let grouped = Dictionary(grouping: expenses, by: \.category)
        return grouped
            .map { category, items in
                CategoryAmount(category: category, amount: items.reduce(Decimal(0)) { $0 + amount($1) })
            }
            .filter { $0.amount != 0 }
            .sorted { $0.amount > $1.amount }
    }
}
