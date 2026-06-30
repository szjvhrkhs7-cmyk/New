import SwiftUI

/// "Состоялось / Отменено" confirmation sheet shown after a planned expense's
/// date has passed, letting the user record the real amount if it differed.
struct ReconcileExpenseSheet: View {
    @Environment(\.dismiss) private var dismiss

    let expense: ExpenseItem
    let onReconcile: (ExpenseItem, ExpenseStatus, Decimal?) -> Void

    @State private var actualAmountText: String

    init(expense: ExpenseItem, onReconcile: @escaping (ExpenseItem, ExpenseStatus, Decimal?) -> Void) {
        self.expense = expense
        self.onReconcile = onReconcile
        _actualAmountText = State(initialValue: NSDecimalNumber(decimal: expense.plannedAmount).stringValue)
    }

    private var parsedAmount: Decimal? {
        let normalized = actualAmountText.replacingOccurrences(of: ",", with: ".")
        return Decimal(string: normalized)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    LabeledContent("Трата", value: expense.title)
                    LabeledContent("План", value: expense.plannedAmount.formattedCurrency())
                }

                Section("Фактическая сумма") {
                    TextField("Сумма", text: $actualAmountText)
                        .keyboardType(.decimalPad)
                }

                Section {
                    Button {
                        onReconcile(expense, .completed, parsedAmount ?? expense.plannedAmount)
                        dismiss()
                    } label: {
                        Label("Трата состоялась", systemImage: "checkmark.circle.fill")
                    }
                    .tint(Theme.positive)

                    Button(role: .destructive) {
                        onReconcile(expense, .cancelled, nil)
                        dismiss()
                    } label: {
                        Label("Трата не состоялась", systemImage: "xmark.circle.fill")
                    }
                }
            }
            .navigationTitle("Подтверждение")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Закрыть") { dismiss() }
                }
            }
        }
        .tint(Theme.accentStrong)
    }
}
