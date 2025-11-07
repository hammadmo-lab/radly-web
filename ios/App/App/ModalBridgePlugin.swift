import UIKit

/// Plugin to bridge native modals with JavaScript layer
class ModalBridgePlugin {

    static let shared = ModalBridgePlugin()

    private var activeModals: [String: NativeModalController] = [:]
    private var transitioningDelegates: [String: ModalTransitioningDelegate] = [:]
    private weak var presentingViewController: UIViewController?

    init() {}

    /// Set the view controller that will present modals
    func setPresentingViewController(_ viewController: UIViewController) {
        self.presentingViewController = viewController
    }

    /// Present a native modal
    func presentModal(
        withIdentifier id: String,
        title: String? = nil,
        animated: Bool = true
    ) {
        guard let presenter = presentingViewController else { return }

        DispatchQueue.main.async {
            let modal = NativeModalController()
            modal.title = title

            let delegate = ModalTransitioningDelegate()
            modal.transitioningDelegate = delegate

            // Keep delegate alive
            self.transitioningDelegates[id] = delegate
            self.activeModals[id] = modal
            modal.presentModally(from: presenter, animated: animated)

            // Notify JS that modal was presented
            self.notifyModalStateChanged(id: id, state: "presented")
        }
    }

    /// Dismiss a native modal
    func dismissModal(withIdentifier id: String, animated: Bool = true) {
        guard let modal = activeModals[id] else { return }

        DispatchQueue.main.async {
            modal.dismiss(animated: animated)
            self.activeModals.removeValue(forKey: id)
            self.transitioningDelegates.removeValue(forKey: id)

            // Notify JS that modal was dismissed
            self.notifyModalStateChanged(id: id, state: "dismissed")
        }
    }

    /// Dismiss all active modals
    func dismissAllModals(animated: Bool = true) {
        for (id, modal) in activeModals {
            modal.dismiss(animated: animated)
            activeModals.removeValue(forKey: id)
            transitioningDelegates.removeValue(forKey: id)
        }
    }

    /// Check if a modal is currently presented
    func isModalPresented(withIdentifier id: String) -> Bool {
        return activeModals[id] != nil
    }

    // MARK: - Notifications

    private func notifyModalStateChanged(id: String, state: String) {
        NotificationCenter.default.post(
            name: NSNotification.Name(rawValue: "NativeModalStateDidChange"),
            object: nil,
            userInfo: [
                "modalId": id,
                "state": state,
                "timestamp": Date().timeIntervalSince1970
            ]
        )
    }
}
