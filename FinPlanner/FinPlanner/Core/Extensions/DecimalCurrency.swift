import Foundation

extension Decimal {
    /// Formats using the user's current currency/locale, e.g. "1 250 ₽".
    func formattedCurrency(locale: Locale = .current) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = locale
        formatter.maximumFractionDigits = 0
        formatter.minimumFractionDigits = 0
        return formatter.string(from: self as NSDecimalNumber) ?? "\(self)"
    }

    /// Signed version for deviation displays, e.g. "+350 ₽" / "−120 ₽".
    func formattedSignedCurrency(locale: Locale = .current) -> String {
        let magnitude = abs(self)
        let formatted = magnitude.formattedCurrency(locale: locale)
        if self > 0 { return "+\(formatted)" }
        if self < 0 { return "−\(formatted)" }
        return formatted
    }
}
