import SwiftUI

/// Flat icon badge used to represent a category in lists and pickers.
struct CategoryBadge: View {
    let category: ExpenseCategory
    var size: CGFloat = 36

    var body: some View {
        Image(systemName: category.symbolName)
            .font(.system(size: size * 0.45, weight: .semibold))
            .foregroundStyle(category.tint)
            .frame(width: size, height: size)
            .background(category.tint.opacity(0.15))
            .clipShape(RoundedRectangle(cornerRadius: size * 0.3, style: .continuous))
    }
}
