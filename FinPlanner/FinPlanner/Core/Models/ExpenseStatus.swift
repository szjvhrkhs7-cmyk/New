import Foundation

/// Lifecycle of a planned expense, used to compute plan vs. fact deviation.
enum ExpenseStatus: String, CaseIterable, Codable {
    /// Still in the future or simply not yet reconciled by the user.
    case planned
    /// User confirmed the spend happened, optionally with a different actual amount.
    case completed
    /// User confirmed the spend did not happen.
    case cancelled

    var title: String {
        switch self {
        case .planned: return "Запланировано"
        case .completed: return "Состоялось"
        case .cancelled: return "Отменено"
        }
    }
}
