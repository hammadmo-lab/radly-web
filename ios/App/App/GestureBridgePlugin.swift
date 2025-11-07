import UIKit

/// Plugin to bridge native gestures with JavaScript layer
class GestureBridgePlugin {

    static let shared = GestureBridgePlugin()

    private var gestureCoordinator: GestureCoordinator?

    private init() {}

    /// Initialize gesture coordinator with a host view
    func initialize(with hostView: UIView) {
        gestureCoordinator = GestureCoordinator(hostView: hostView)
    }

    /// Enable or disable gesture recognition
    func setGesturesEnabled(_ enabled: Bool) {
        gestureCoordinator?.setEnabled(enabled)
    }

    /// Disable specific gesture type
    /// - Parameter type: "edgeSwipe" or "pullToRefresh"
    func disableGesture(_ type: String) {
        switch type.lowercased() {
        case "edgeswipe":
            gestureCoordinator?.setEnabled(false)
        case "pulltorefresh":
            gestureCoordinator?.setEnabled(false)
        default:
            break
        }
    }

    /// Enable specific gesture type
    /// - Parameter type: "edgeSwipe" or "pullToRefresh"
    func enableGesture(_ type: String) {
        switch type.lowercased() {
        case "edgeswipe":
            gestureCoordinator?.setEnabled(true)
        case "pulltorefresh":
            gestureCoordinator?.setEnabled(true)
        default:
            break
        }
    }

    /// End refresh manually
    func endRefresh() {
        gestureCoordinator?.endRefresh()
    }
}
