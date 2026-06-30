import SwiftUI

/// Full-screen cover shown while the optional Face ID lock is engaged and
/// not yet unlocked for this session.
struct AppLockView: View {
    @EnvironmentObject private var authManager: BiometricAuthManager

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "faceid")
                .font(.system(size: 56))
                .foregroundStyle(Theme.accentStrong)
            Text("Финансовый планировщик заблокирован")
                .font(.headline)
            Button("Разблокировать") {
                Task { await authManager.authenticate() }
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.accentStrong)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.background)
        .task { await authManager.authenticate() }
    }
}
