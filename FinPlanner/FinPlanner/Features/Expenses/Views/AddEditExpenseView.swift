import SwiftUI
import SwiftData

/// Create or edit a planned expense. Creating (or changing the date of) an
/// expense pushes the change to the system calendar via `calendarSyncService`
/// — that's the "automatic event creation" half of the two-way sync.
struct AddEditExpenseView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.calendarSyncService) private var calendarService
    @Environment(\.dismiss) private var dismiss

    let week: WeekInterval
    var editingExpense: ExpenseItem?

    @State private var title = ""
    @State private var amountText = ""
    @State private var category: ExpenseCategory = .other
    @State private var date: Date
    @State private var note = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    init(week: WeekInterval, editingExpense: ExpenseItem? = nil) {
        self.week = week
        self.editingExpense = editingExpense
        _date = State(initialValue: editingExpense?.plannedDate ?? week.start)
        _title = State(initialValue: editingExpense?.title ?? "")
        _category = State(initialValue: editingExpense?.category ?? .other)
        _note = State(initialValue: editingExpense?.note ?? "")
        if let amount = editingExpense?.plannedAmount {
            _amountText = State(initialValue: NSDecimalNumber(decimal: amount).stringValue)
        }
    }

    private var isValid: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && parsedAmount != nil
    }

    private var parsedAmount: Decimal? {
        let normalized = amountText.replacingOccurrences(of: ",", with: ".")
        guard let value = Decimal(string: normalized), value > 0 else { return nil }
        return value
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Трата") {
                    TextField("Название", text: $title)
                    TextField("Сумма", text: $amountText)
                        .keyboardType(.decimalPad)
                    Picker("Категория", selection: $category) {
                        ForEach(ExpenseCategory.allCases) { category in
                            Label(category.title, systemImage: category.symbolName).tag(category)
                        }
                    }
                    DatePicker("Дата", selection: $date, in: week.start..<week.end, displayedComponents: .date)
                }

                Section("Заметка") {
                    TextField("Необязательно", text: $note, axis: .vertical)
                        .lineLimit(3...6)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(Theme.negative)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle(editingExpense == nil ? "Новая трата" : "Изменить трату")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") { save() }
                        .disabled(!isValid || isSaving)
                }
            }
        }
        .tint(Theme.accentStrong)
    }

    private func save() {
        guard let amount = parsedAmount else { return }
        isSaving = true

        let expense = editingExpense ?? ExpenseItem(
            title: title,
            plannedAmount: amount,
            category: category,
            plannedDate: date
        )
        expense.title = title
        expense.plannedAmount = amount
        expense.category = category
        expense.plannedDate = date
        expense.note = note

        if editingExpense == nil {
            modelContext.insert(expense)
        }

        Task {
            do {
                expense.eventIdentifier = try await calendarService.syncToCalendar(expense)
            } catch {
                errorMessage = "Не удалось синхронизировать с календарём: \(error.localizedDescription)"
            }
            isSaving = false
            dismiss()
        }
    }
}
