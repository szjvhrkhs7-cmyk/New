import UIKit

/// Renders a simple one-or-more-page report: a header with the period
/// summary, a category breakdown, and a table of every expense.
enum PDFExporter {
    private static let pageSize = CGRect(x: 0, y: 0, width: 595, height: 842) // A4 at 72dpi
    private static let margin: CGFloat = 36

    static func makePDF(
        periodTitle: String,
        expenses: [ExpenseItem],
        summary: PlanFactSummary,
        categoryBreakdown: [CategoryAmount]
    ) -> Data {
        let renderer = UIGraphicsPDFRenderer(bounds: pageSize)
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "dd.MM.yyyy"
        let sortedExpenses = expenses.sorted { $0.plannedDate < $1.plannedDate }

        return renderer.pdfData { context in
            context.beginPage()
            var y = drawHeader(periodTitle: periodTitle, summary: summary)
            y = drawCategoryBreakdown(categoryBreakdown, startingAt: y)
            y = drawTableHeader(startingAt: y)

            for expense in sortedExpenses {
                if y > pageSize.height - margin - 20 {
                    context.beginPage()
                    y = margin
                    y = drawTableHeader(startingAt: y)
                }
                y = drawExpenseRow(expense, dateFormatter: dateFormatter, startingAt: y)
            }
        }
    }

    private static func drawHeader(periodTitle: String, summary: PlanFactSummary) -> CGFloat {
        var y = margin
        let title = "Отчёт по тратам — \(periodTitle)"
        title.draw(at: CGPoint(x: margin, y: y), withAttributes: [
            .font: UIFont.boldSystemFont(ofSize: 18)
        ])
        y += 28

        let summaryLine = "Запланировано: \(summary.plannedTotal.formattedCurrency())   "
            + "Факт: \(summary.actualTotal.formattedCurrency())   "
            + "Отклонение: \(summary.deviation.formattedSignedCurrency())"
        summaryLine.draw(at: CGPoint(x: margin, y: y), withAttributes: [
            .font: UIFont.systemFont(ofSize: 12),
            .foregroundColor: UIColor.darkGray
        ])
        return y + 28
    }

    private static func drawCategoryBreakdown(_ breakdown: [CategoryAmount], startingAt startY: CGFloat) -> CGFloat {
        guard !breakdown.isEmpty else { return startY }
        var y = startY
        "По категориям".draw(at: CGPoint(x: margin, y: y), withAttributes: [
            .font: UIFont.boldSystemFont(ofSize: 13)
        ])
        y += 18
        for item in breakdown {
            "\(item.category.title): \(item.amount.formattedCurrency())".draw(
                at: CGPoint(x: margin, y: y),
                withAttributes: [.font: UIFont.systemFont(ofSize: 11)]
            )
            y += 16
        }
        return y + 12
    }

    private static func drawTableHeader(startingAt startY: CGFloat) -> CGFloat {
        let columns = ["Дата", "Название", "Категория", "Статус", "Сумма"]
        let xs: [CGFloat] = [margin, margin + 70, margin + 230, margin + 350, margin + 440]
        for (column, x) in zip(columns, xs) {
            column.draw(at: CGPoint(x: x, y: startY), withAttributes: [
                .font: UIFont.boldSystemFont(ofSize: 10)
            ])
        }
        return startY + 18
    }

    private static func drawExpenseRow(_ expense: ExpenseItem, dateFormatter: DateFormatter, startingAt startY: CGFloat) -> CGFloat {
        let xs: [CGFloat] = [margin, margin + 70, margin + 230, margin + 350, margin + 440]
        let values = [
            dateFormatter.string(from: expense.plannedDate),
            expense.title,
            expense.category.title,
            expense.status.title,
            expense.effectiveAmount.formattedCurrency()
        ]
        for (value, x) in zip(values, xs) {
            value.draw(
                in: CGRect(x: x, y: startY, width: 160, height: 16),
                withAttributes: [.font: UIFont.systemFont(ofSize: 9)]
            )
        }
        return startY + 16
    }
}
