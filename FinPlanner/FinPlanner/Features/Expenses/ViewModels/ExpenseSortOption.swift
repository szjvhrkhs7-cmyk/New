import Foundation

enum ExpenseSortOption: String, CaseIterable, Identifiable {
    case dateAdded
    case amount
    case category

    var id: String { rawValue }

    var title: String {
        switch self {
        case .dateAdded: return "По дате добавления"
        case .amount: return "По сумме"
        case .category: return "По категории"
        }
    }

    func sort(_ items: [ExpenseItem]) -> [ExpenseItem] {
        switch self {
        case .dateAdded:
            return items.sorted { $0.createdAt > $1.createdAt }
        case .amount:
            return items.sorted { $0.plannedAmount > $1.plannedAmount }
        case .category:
            return items.sorted { $0.category.title.localizedCompare($1.category.title) == .orderedAscending }
        }
    }
}
