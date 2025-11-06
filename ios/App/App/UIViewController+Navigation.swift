import UIKit

extension UIViewController {
    /// Get the native navigation controller if available
    var nativeNavigationController: NativeNavigationController? {
        navigationController as? NativeNavigationController
    }

    /// Safely pop view controller
    func safePopViewController(animated: Bool = true) {
        navigationController?.popViewController(animated: animated)
    }

    /// Safely pop to root
    func safePopToRoot(animated: Bool = true) {
        navigationController?.popToRootViewController(animated: animated)
    }

    /// Check if we can go back
    var canGoBack: Bool {
        (navigationController?.viewControllers.count ?? 0) > 1
    }

    /// Get current navigation depth
    var navigationDepth: Int {
        navigationController?.viewControllers.count ?? 0
    }
}
