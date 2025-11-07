import UIKit

extension UIView {
    /// Get current safe area insets
    var currentSafeAreaInsets: UIEdgeInsets {
        if #available(iOS 11.0, *) {
            return safeAreaInsets
        }
        return .zero
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
