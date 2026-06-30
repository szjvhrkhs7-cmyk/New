import SwiftData

/// Owns the single `ModelContainer` for the app. Kept as a thin wrapper so
/// tests can spin up an in-memory container without touching disk.
enum PersistenceController {
    static let schema = Schema([ExpenseItem.self])

    static func makeContainer(inMemory: Bool = false) -> ModelContainer {
        let configuration = ModelConfiguration(isStoredInMemoryOnly: inMemory)
        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }
}
