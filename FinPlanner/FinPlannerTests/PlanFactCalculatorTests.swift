import XCTest
@testable import FinPlanner

final class PlanFactCalculatorTests: XCTestCase {
    func testEmptyExpensesProduceZeroSummary() {
        let summary = PlanFactCalculator.summary(for: [])
        XCTAssertEqual(summary.plannedTotal, 0)
        XCTAssertEqual(summary.actualTotal, 0)
        XCTAssertEqual(summary.deviation, 0)
        XCTAssertNil(summary.completionRatio)
    }

    func testStillPlannedExpenseCountsTowardPlannedButNotRatio() {
        let expense = ExpenseItem(title: "Кофе", plannedAmount: 500, category: .groceries, plannedDate: .now)
        let summary = PlanFactCalculator.summary(for: [expense])

        XCTAssertEqual(summary.plannedTotal, 500)
        XCTAssertEqual(summary.actualTotal, 500) // effectiveAmount falls back to planned while still planned
        XCTAssertNil(summary.completionRatio, "Ratio should ignore expenses that haven't been reconciled yet")
    }

    func testCompletedExpenseWithHigherActualAmountShowsOverspend() {
        let expense = ExpenseItem(title: "Такси", plannedAmount: 300, category: .transport, plannedDate: .now)
        expense.status = .completed
        expense.actualAmount = 450

        let summary = PlanFactCalculator.summary(for: [expense])

        XCTAssertEqual(summary.actualTotal, 450)
        XCTAssertEqual(summary.deviation, 150)
        XCTAssertEqual(summary.completionRatio, 1.5, accuracy: 0.0001)
    }

    func testCancelledExpenseContributesZeroToActualTotal() {
        let expense = ExpenseItem(title: "Кино", plannedAmount: 800, category: .entertainment, plannedDate: .now)
        expense.status = .cancelled

        let summary = PlanFactCalculator.summary(for: [expense])

        XCTAssertEqual(summary.plannedTotal, 800)
        XCTAssertEqual(summary.actualTotal, 0)
        XCTAssertEqual(summary.deviation, -800)
        XCTAssertEqual(summary.completionRatio, 0)
    }

    func testCategoryBreakdownGroupsAndSortsDescending() {
        let groceries1 = ExpenseItem(title: "Молоко", plannedAmount: 100, category: .groceries, plannedDate: .now)
        let groceries2 = ExpenseItem(title: "Хлеб", plannedAmount: 50, category: .groceries, plannedDate: .now)
        let transport = ExpenseItem(title: "Метро", plannedAmount: 60, category: .transport, plannedDate: .now)

        let breakdown = PlanFactCalculator.categoryBreakdown(for: [groceries1, groceries2, transport])

        XCTAssertEqual(breakdown.count, 2)
        XCTAssertEqual(breakdown.first?.category, .groceries)
        XCTAssertEqual(breakdown.first?.amount, 150)
        XCTAssertEqual(breakdown.last?.category, .transport)
        XCTAssertEqual(breakdown.last?.amount, 60)
    }

    func testCategoryBreakdownExcludesZeroAmountCategories() {
        let cancelled = ExpenseItem(title: "Подписка", plannedAmount: 200, category: .subscriptions, plannedDate: .now)
        cancelled.status = .cancelled

        let breakdown = PlanFactCalculator.categoryBreakdown(for: [cancelled])

        XCTAssertTrue(breakdown.isEmpty)
    }
}
