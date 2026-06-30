import Foundation

enum CSVExporter {
    private static let header = "Дата;Название;Категория;Статус;План;Факт"

    /// Builds CSV text (semicolon-separated, since comma is the decimal
    /// separator in `ru_RU` locale spreadsheets) for the given expenses,
    /// oldest date first.
    static func makeCSV(for expenses: [ExpenseItem]) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "dd.MM.yyyy"

        let rows = expenses
            .sorted { $0.plannedDate < $1.plannedDate }
            .map { expense -> String in
                let date = dateFormatter.string(from: expense.plannedDate)
                let actual = expense.actualAmount.map { "\($0)" } ?? ""
                return [
                    date,
                    escape(expense.title),
                    escape(expense.category.title),
                    expense.status.title,
                    "\(expense.plannedAmount)",
                    actual
                ].joined(separator: ";")
            }

        return ([header] + rows).joined(separator: "\n")
    }

    /// Writes the CSV to a temporary file suitable for the share sheet.
    static func write(_ csv: String, filename: String = "expenses.csv") throws -> URL {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
        try csv.data(using: .utf8)?.write(to: url, options: .atomic)
        return url
    }

    private static func escape(_ field: String) -> String {
        guard field.contains(";") || field.contains("\"") || field.contains("\n") else { return field }
        return "\"\(field.replacingOccurrences(of: "\"", with: "\"\""))\""
    }
}
