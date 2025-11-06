import UIKit

extension UIView {
    /// Get current safe area insets
    var currentSafeAreaInsets: UIEdgeInsets {
        if #available(iOS 11.0, *) {
            return safeAreaInsets
        }
        return .zero
    }

    /// Observe safe area changes (for handling notch, Dynamic Island, rotation)
    func observeSafeAreaChanges(_ handler: @escaping (UIEdgeInsets) -> Void) {
        // Use KVO to observe safe area insets changes
        addObserver(forKeyPath: "safeAreaInsets", options: [.new, .old]) { (change) in
            handler(self.currentSafeAreaInsets)
        }
    }

    /// Safe area as a dictionary for bridge messages
    var safeAreaInsetsDict: [String: CGFloat] {
        let insets = currentSafeAreaInsets
        return [
            "top": insets.top,
            "bottom": insets.bottom,
            "left": insets.left,
            "right": insets.right
        ]
    }
}
