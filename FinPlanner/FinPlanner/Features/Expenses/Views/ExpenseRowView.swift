import SwiftUI

struct ExpenseRowView: View {
    let expense: ExpenseItem

    private var dateLabel: String {
        expense.plannedDate.formatted(.dateTime.day().month(.abbreviated).weekday(.abbreviated))
    }

    var body: some View {
        HStack(spacing: 12) {
            CategoryBadge(category: expense.category)

            VStack(alignment: .leading, spacing: 4) {
                Text(expense.title)
                    .font(.body.weight(.medium))
                    .foregroundStyle(Theme.textPrimary)
                Text("\(expense.category.title) · \(dateLabel)")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(expense.plannedAmount.formattedCurrency())
                    .font(.body.weight(.semibold))
                statusBadge
            }
        }
        .padding(.vertical, 6)
    }

    @ViewBuilder
    private var statusBadge: some View {
        switch expense.status {
        case .planned:
            if expense.eventIdentifier != nil {
                Label("В календаре", systemImage: "calendar")
                    .labelStyle(.iconOnly)
                    .font(.caption)
                    .foregroundStyle(Theme.accentStrong)
            }
        case .completed:
            Text("Состоялось")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Theme.positive)
        case .cancelled:
            Text("Отменено")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Theme.textSecondary)
                .strikethrough()
        }
    }
}
