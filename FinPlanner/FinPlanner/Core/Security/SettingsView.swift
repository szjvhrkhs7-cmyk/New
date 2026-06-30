import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var authManager: BiometricAuthManager
    @Environment(\.dismiss) private var dismiss
    @State private var isAppLockEnabled: Bool

    init() {
        _isAppLockEnabled = State(initialValue: false)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Защита Face ID", isOn: $isAppLockEnabled)
                        .disabled(!authManager.biometryIsAvailable)
                } footer: {
                    if !authManager.biometryIsAvailable {
                        Text("Face ID недоступен на этом устройстве")
                    } else {
                        Text("Приложение будет запрашивать Face ID при каждом запуске")
                    }
                }
            }
            .navigationTitle("Настройки")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Готово") { dismiss() }
                }
            }
            .onAppear { isAppLockEnabled = authManager.isAppLockEnabled }
            .onChange(of: isAppLockEnabled) { _, newValue in
                authManager.isAppLockEnabled = newValue
            }
        }
        .tint(Theme.accentStrong)
    }
}
