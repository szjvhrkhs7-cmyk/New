import LocalAuthentication
import Foundation

/// Wraps `LAContext` for the optional Face ID app lock. The lock itself is
/// off by default — the brief calls it out as optional — and is toggled in
/// Settings via `isAppLockEnabled`.
@MainActor
final class BiometricAuthManager: ObservableObject {
    @Published var isUnlocked = false

    var isAppLockEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: "isAppLockEnabled") }
        set { UserDefaults.standard.set(newValue, forKey: "isAppLockEnabled") }
    }

    var biometryIsAvailable: Bool {
        let context = LAContext()
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
    }

    func authenticate() async {
        guard isAppLockEnabled else {
            isUnlocked = true
            return
        }

        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            // No biometrics enrolled/available — don't lock the user out of their data.
            isUnlocked = true
            return
        }

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "Разблокируйте, чтобы увидеть свои траты"
            )
            isUnlocked = success
        } catch {
            isUnlocked = false
        }
    }

    func lock() {
        isUnlocked = false
    }
}
