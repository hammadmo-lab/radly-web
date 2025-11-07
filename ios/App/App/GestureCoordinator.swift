import UIKit

/// Coordinates native gestures and bridges them to JavaScript
class GestureCoordinator: NSObject {

    private weak var hostView: UIView?
    private var panGestureRecognizer: UIPanGestureRecognizer?
    private var refreshControl: UIRefreshControl?
    private var isEnabled = true

    init(hostView: UIView) {
        super.init()
        self.hostView = hostView
        setupGestures()
    }

    // MARK: - Setup

    private func setupGestures() {
        guard let view = hostView else { return }

        // Edge pan gesture for back/forward navigation
        let edgePan = UIScreenEdgePanGestureRecognizer(
            target: self,
            action: #selector(handleEdgePan(_:))
        )
        edgePan.edges = .left
        edgePan.delegate = self
        view.addGestureRecognizer(edgePan)
        panGestureRecognizer = edgePan

        // Pull-to-refresh gesture
        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(self, action: #selector(handleRefresh(_:)), for: .valueChanged)
        self.refreshControl = refreshControl
    }

    // MARK: - Edge Pan Gesture

    @objc private func handleEdgePan(_ gesture: UIScreenEdgePanGestureRecognizer) {
        guard isEnabled else { return }

        let translation = gesture.translation(in: hostView)
        let percent = translation.x / (hostView?.bounds.width ?? 1)

        switch gesture.state {
        case .began:
            notifyGestureProgress(type: "edgeSwipe", state: "began", progress: 0)

        case .changed:
            notifyGestureProgress(type: "edgeSwipe", state: "changed", progress: min(percent, 1.0))

        case .ended:
            let velocity = gesture.velocity(in: hostView).x
            let shouldComplete = percent > 0.3 || velocity > 1000
            notifyGestureProgress(
                type: "edgeSwipe",
                state: shouldComplete ? "completed" : "cancelled",
                progress: percent
            )

        case .cancelled, .failed:
            notifyGestureProgress(type: "edgeSwipe", state: "cancelled", progress: 0)

        case .possible:
            break

        @unknown default:
            break
        }
    }

    // MARK: - Pull-to-Refresh

    @objc private func handleRefresh(_ sender: UIRefreshControl) {
        notifyGestureProgress(type: "pullToRefresh", state: "triggered", progress: 1.0)

        // Automatically end refresh after 2 seconds if not stopped by JS
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            sender.endRefreshing()
        }
    }

    // MARK: - Control

    /// Enable or disable gesture recognition
    func setEnabled(_ enabled: Bool) {
        isEnabled = enabled
        panGestureRecognizer?.isEnabled = enabled
        refreshControl?.isEnabled = enabled
    }

    /// Manually trigger refresh end
    func endRefresh() {
        refreshControl?.endRefreshing()
    }

    // MARK: - Notifications

    private func notifyGestureProgress(type: String, state: String, progress: CGFloat) {
        NotificationCenter.default.post(
            name: NSNotification.Name(rawValue: "NativeGestureProgress"),
            object: nil,
            userInfo: [
                "gestureType": type,
                "state": state,
                "progress": progress,
                "timestamp": Date().timeIntervalSince1970
            ]
        )
    }
}

// MARK: - UIGestureRecognizerDelegate

extension GestureCoordinator: UIGestureRecognizerDelegate {
    func gestureRecognizer(
        _ gestureRecognizer: UIGestureRecognizer,
        shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer
    ) -> Bool {
        // Allow edge pan to work with other gestures
        return true
    }

    func gestureRecognizer(
        _ gestureRecognizer: UIGestureRecognizer,
        shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer
    ) -> Bool {
        // Prioritize edge pan over other pan gestures
        if gestureRecognizer == panGestureRecognizer {
            return otherGestureRecognizer is UIPanGestureRecognizer
        }
        return false
    }
}
