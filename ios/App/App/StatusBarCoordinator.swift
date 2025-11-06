import UIKit

/// Manages status bar styling and safe area handling
class StatusBarCoordinator {

    func updateStatusBar(for viewController: UIViewController) {
        // Set the preferred status bar style and notify the system
        viewController.setNeedsStatusBarAppearanceUpdate()

        // Optionally animate status bar updates
        UIView.animate(withDuration: 0.3) {
            viewController.setNeedsStatusBarAppearanceUpdate()
        }
    }

    /// Publishes safe area changes to the Capacitor bridge
    func notifySafeAreaChanged(in view: UIView) {
        guard let safeAreaInsets = view.window?.safeAreaInsets else { return }

        let data: JSObject = [
            "top": safeAreaInsets.top,
            "bottom": safeAreaInsets.bottom,
            "left": safeAreaInsets.left,
            "right": safeAreaInsets.right
        ]

        // Notify JS layer of safe area changes via Capacitor
        // This will be picked up by SafeAreaView component on the web layer
        NotificationCenter.default.post(
            name: NSNotification.Name(rawValue: "SafeAreaDidChange"),
            object: nil,
            userInfo: ["insets": data]
        )
    }

    /// Get current safe area insets as a dictionary
    func getSafeAreaInsets(for view: UIView) -> [String: CGFloat] {
        let insets = view.safeAreaInsets
        return [
            "top": insets.top,
            "bottom": insets.bottom,
            "left": insets.left,
            "right": insets.right
        ]
    }
}
