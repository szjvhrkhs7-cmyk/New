import SwiftUI

@main
struct FinPlannerApp: App {
    private let modelContainer = PersistenceController.makeContainer()
    @StateObject private var authManager = BiometricAuthManager()
    @StateObject private var calendarServiceBox = CalendarServiceBox()

    var body: some Scene {
        WindowGroup {
            ZStack {
                RootTabView()
                    .environment(\.calendarSyncService, calendarServiceBox.service)
                    .environmentObject(authManager)

                if authManager.isAppLockEnabled && !authManager.isUnlocked {
                    AppLockView()
                        .environmentObject(authManager)
                        .transition(.opacity)
                }
            }
            .animation(.default, value: authManager.isUnlocked)
            .task {
                await authManager.authenticate()
            }
        }
        .modelContainer(modelContainer)
    }
}

/// `EventKitCalendarSyncService` is `@MainActor`-isolated; this tiny box lets
/// it be created lazily as a `StateObject` without making the whole App
/// struct main-actor bound at init time.
@MainActor
private final class CalendarServiceBox: ObservableObject {
    let service: CalendarSyncing = EventKitCalendarSyncService()
}
