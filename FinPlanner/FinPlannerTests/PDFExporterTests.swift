import XCTest
@testable import FinPlanner

final class PDFExporterTests: XCTestCase {
    func testGeneratedDataIsAValidPDF() {
        let expense = ExpenseItem(title: "Продукты", plannedAmount: 1200, category: .groceries, plannedDate: .now)
        let summary = PlanFactCalculator.summary(for: [expense])
        let breakdown = PlanFactCalculator.categoryBreakdown(for: [expense])

        let data = PDFExporter.makePDF(
            periodTitle: "Июнь 2026",
            expenses: [expense],
            summary: summary,
            categoryBreakdown: breakdown
        )

        XCTAssertFalse(data.isEmpty)
        XCTAssertEqual(data.prefix(5), Data("%PDF-".utf8))
    }

    func testEmptyExpenseListStillProducesAPDF() {
        let data = PDFExporter.makePDF(periodTitle: "Пусто", expenses: [], summary: .zero, categoryBreakdown: [])
        XCTAssertEqual(data.prefix(5), Data("%PDF-".utf8))
    }
}
