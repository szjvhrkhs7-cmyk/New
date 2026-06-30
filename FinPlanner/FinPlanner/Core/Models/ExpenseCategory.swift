import SwiftUI

/// Built-in spending categories. Stored on `ExpenseItem` by raw value so the
/// enum can evolve without a Core Data style migration.
enum ExpenseCategory: String, CaseIterable, Identifiable, Codable {
    case groceries
    case transport
    case housing
    case entertainment
    case health
    case shopping
    case education
    case subscriptions
    case other

    var id: String { rawValue }

    var title: String {
        switch self {
        case .groceries: return "Продукты"
        case .transport: return "Транспорт"
        case .housing: return "Жильё"
        case .entertainment: return "Развлечения"
        case .health: return "Здоровье"
        case .shopping: return "Покупки"
        case .education: return "Образование"
        case .subscriptions: return "Подписки"
        case .other: return "Другое"
        }
    }

    var symbolName: String {
        switch self {
        case .groceries: return "cart.fill"
        case .transport: return "car.fill"
        case .housing: return "house.fill"
        case .entertainment: return "popcorn.fill"
        case .health: return "heart.fill"
        case .shopping: return "bag.fill"
        case .education: return "book.fill"
        case .subscriptions: return "repeat.circle.fill"
        case .other: return "ellipsis.circle.fill"
        }
    }

    var tint: Color {
        switch self {
        case .groceries: return .categoryGroceries
        case .transport: return .categoryTransport
        case .housing: return .categoryHousing
        case .entertainment: return .categoryEntertainment
        case .health: return .categoryHealth
        case .shopping: return .categoryShopping
        case .education: return .categoryEducation
        case .subscriptions: return .categorySubscriptions
        case .other: return .categoryOther
        }
    }
}
