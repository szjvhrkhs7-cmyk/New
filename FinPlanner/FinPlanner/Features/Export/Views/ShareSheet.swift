import SwiftUI
import UIKit

/// Thin wrapper around `UIActivityViewController` so SwiftUI can present the
/// standard iOS share sheet for exported files.
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
