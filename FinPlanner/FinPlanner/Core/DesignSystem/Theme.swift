import SwiftUI

/// Central palette for the "white + iOS blue" minimalist design described in
/// the product brief. Every screen pulls colors from here instead of
/// hardcoding hex values so the look stays consistent and themeable.
enum Theme {
    static let accent = Color(hex: 0x5AC8FA)
    static let accentStrong = Color(hex: 0x0A84FF)

    static let background = Color(.systemBackground)
    static let secondaryBackground = Color(.secondarySystemBackground)
    static let cardBackground = Color(.systemBackground)

    static let textPrimary = Color(.label)
    static let textSecondary = Color(.secondaryLabel)

    static let positive = Color(hex: 0x34C759)
    static let negative = Color(hex: 0xFF3B30)

    static let cardCornerRadius: CGFloat = 16
    static let controlCornerRadius: CGFloat = 12
    static let cardPadding: CGFloat = 16
    static let sectionSpacing: CGFloat = 20
}

extension Color {
    static let categoryGroceries = Color(hex: 0x34C759)
    static let categoryTransport = Color(hex: 0x5AC8FA)
    static let categoryHousing = Color(hex: 0xAF52DE)
    static let categoryEntertainment = Color(hex: 0xFF9500)
    static let categoryHealth = Color(hex: 0xFF3B30)
    static let categoryShopping = Color(hex: 0x007AFF)
    static let categoryEducation = Color(hex: 0x5856D6)
    static let categorySubscriptions = Color(hex: 0xFF2D55)
    static let categoryOther = Color(hex: 0x8E8E93)
}
