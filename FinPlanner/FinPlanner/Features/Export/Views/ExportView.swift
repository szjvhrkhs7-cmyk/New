import SwiftUI
import SwiftData

private enum ExportFormat: String, CaseIterable, Identifiable {
    case csv = "CSV"
    case pdf = "PDF"
    var id: String { rawValue }
}

struct ExportView: View {
    @Query private var allExpenses: [ExpenseItem]

    @State private var format: ExportFormat = .pdf
    @State private var startDate = Calendar.current.date(byAdding: .month, value: -1, to: .now) ?? .now
    @State private var endDate = Date.now
    @State private var shareItem: ShareableFile?
    @State private var errorMessage: String?

    private var expensesInRange: [ExpenseItem] {
        allExpenses.filter { $0.plannedDate >= startDate && $0.plannedDate <= endDate }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Период") {
                    DatePicker("С", selection: $startDate, displayedComponents: .date)
                    DatePicker("По", selection: $endDate, displayedComponents: .date)
                }

                Section("Формат") {
                    Picker("Формат", selection: $format) {
                        ForEach(ExportFormat.allCases) { format in
                            Text(format.rawValue).tag(format)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section {
                    LabeledContent("Трат в выбранном периоде", value: "\(expensesInRange.count)")
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage).foregroundStyle(Theme.negative).font(.footnote)
                    }
                }

                Section {
                    Button {
                        export()
                    } label: {
                        Label("Поделиться файлом", systemImage: "square.and.arrow.up")
                    }
                    .disabled(expensesInRange.isEmpty)
                }
            }
            .navigationTitle("Экспорт")
            .sheet(item: $shareItem) { item in
                ShareSheet(items: [item.url])
            }
        }
        .tint(Theme.accentStrong)
    }

    private func export() {
        errorMessage = nil
        do {
            switch format {
            case .csv:
                let csv = CSVExporter.makeCSV(for: expensesInRange)
                shareItem = ShareableFile(url: try CSVExporter.write(csv))
            case .pdf:
                let summary = PlanFactCalculator.summary(for: expensesInRange)
                let breakdown = PlanFactCalculator.categoryBreakdown(for: expensesInRange)
                let periodTitle = "\(startDate.formatted(date: .abbreviated, time: .omitted)) – \(endDate.formatted(date: .abbreviated, time: .omitted))"
                let data = PDFExporter.makePDF(
                    periodTitle: periodTitle,
                    expenses: expensesInRange,
                    summary: summary,
                    categoryBreakdown: breakdown
                )
                let url = FileManager.default.temporaryDirectory.appendingPathComponent("report.pdf")
                try data.write(to: url, options: .atomic)
                shareItem = ShareableFile(url: url)
            }
        } catch {
            errorMessage = "Не удалось подготовить файл: \(error.localizedDescription)"
        }
    }
}

private struct ShareableFile: Identifiable {
    let url: URL
    var id: String { url.absoluteString }
}

#Preview {
    ExportView()
        .modelContainer(PersistenceController.makeContainer(inMemory: true))
}
