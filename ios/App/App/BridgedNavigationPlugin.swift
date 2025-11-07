import UIKit

/// Plugin to bridge native navigation with JavaScript layer
/// Allows JS to control native navigation stack: push, pop, reset
class BridgedNavigationPlugin {

    static let shared = BridgedNavigationPlugin()

    private weak var navigationController: UINavigationController?

    init() {}

    /// Set the navigation controller to manage
    func setNavigationController(_ navController: UINavigationController) {
        self.navigationController = navController
    }

    /// Pop the current view controller
    func popViewController(animated: Bool = true) {
        DispatchQueue.main.async {
            self.navigationController?.popViewController(animated: animated)
        }
    }

    /// Pop to root view controller
    func popToRoot(animated: Bool = true) {
        DispatchQueue.main.async {
            self.navigationController?.popToRootViewController(animated: animated)
        }
    }

    /// Get current navigation stack depth
    var stackDepth: Int {
        navigationController?.viewControllers.count ?? 0
    }

    /// Check if back navigation is possible
    var canGoBack: Bool {
        (navigationController?.viewControllers.count ?? 0) > 1
    }

    /// Notify about navigation state changes
    func notifyNavigationStateChanged() {
        // This would be called via Capacitor to notify JS of navigation changes
        // Useful for analytics and router synchronization
        let state: [String: Any] = [
            "depth": stackDepth,
            "canGoBack": canGoBack,
            "timestamp": Date().timeIntervalSince1970
        ]

        // Post notification that JS can listen to
        NotificationCenter.default.post(
            name: NSNotification.Name(rawValue: "NativeNavigationStateDidChange"),
            object: nil,
            userInfo: state
        )
    }
}
