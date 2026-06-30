import XCTest
@testable import FinPlanner

final class CSVExporterTests: XCTestCase {
    func testCSVStartsWithHeaderRow() {
        let csv = CSVExporter.makeCSV(for: [])
        XCTAssertEqual(csv, "Дата;Название;Категория;Статус;План;Факт")
    }

    func testCSVRowsAreSortedByDateAscending() {
        let calendar = Calendar(identifier: .gregorian)
        let later = ExpenseItem(
            title: "Позже",
            plannedAmount: 100,
            category: .other,
            plannedDate: calendar.date(from: DateComponents(year: 2026, month: 6, day: 10))!
        )
        let earlier = ExpenseItem(
            title: "Раньше",
            plannedAmount: 50,
            category: .other,
            plannedDate: calendar.date(from: DateComponents(year: 2026, month: 6, day: 1))!
        )

        let csv = CSVExporter.makeCSV(for: [later, earlier])
        let lines = csv.split(separator: "\n")

        XCTAssertEqual(lines.count, 3) // header + 2 rows
        XCTAssertTrue(lines[1].contains("Раньше"))
        XCTAssertTrue(lines[2].contains("Позже"))
    }

    func testFieldsContainingSemicolonsAreQuoted() {
        let expense = ExpenseItem(
            title: "Обед; кафе",
            plannedAmount: 250,
            category: .groceries,
            plannedDate: .now
        )

        let csv = CSVExporter.makeCSV(for: [expense])
        XCTAssertTrue(csv.contains("\"Обед; кафе\""))
    }

    func testWriteProducesReadableFile() throws {
        let csv = CSVExporter.makeCSV(for: [])
        let url = try CSVExporter.write(csv, filename: "test-export.csv")
        defer { try? FileManager.default.removeItem(at: url) }

        let contents = try String(contentsOf: url, encoding: .utf8)
        XCTAssertEqual(contents, csv)
    }
}
