import UIKit

/// Custom navigation controller that manages the Capacitor bridge with native back-swipe gestures
class NativeNavigationController: UINavigationController {

    private var interactiveGestureRecognizer: UIScreenEdgePanGestureRecognizer?

    override func viewDidLoad() {
        super.viewDidLoad()
        setupInteractiveBackGesture()
        configureNavigationAppearance()
    }

    // MARK: - Interactive Back Gesture

    private func setupInteractiveBackGesture() {
        // Enable interactive pop gesture recognizer
        interactivePopGestureRecognizer?.isEnabled = true
        interactivePopGestureRecognizer?.delegate = self

        // Create edge swipe recognizer for left edge
        let edgePanGesture = UIScreenEdgePanGestureRecognizer(
            target: self,
            action: #selector(handleEdgePan(_:))
        )
        edgePanGesture.edges = .left
        view.addGestureRecognizer(edgePanGesture)
        interactiveGestureRecognizer = edgePanGesture
    }

    @objc private func handleEdgePan(_ gesture: UIScreenEdgePanGestureRecognizer) {
        let translation = gesture.translation(in: view)
        let percent = translation.x / view.bounds.width

        switch gesture.state {
        case .began:
            popViewController(animated: true)
        case .changed:
            // Update interactive transition progress
            break
        case .cancelled, .failed:
            break
        case .ended:
            // Complete or cancel based on velocity and progress
            let velocity = gesture.velocity(in: view).x
            if percent > 0.3 || velocity > 1000 {
                // Complete the pop
            } else {
                // Cancel the pop
            }
        case .possible:
            break
        @unknown default:
            break
        }
    }

    // MARK: - Navigation Appearance

    private func configureNavigationAppearance() {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()

        // Set colors from design tokens
        let tokens = DesignTokens.shared
        appearance.backgroundColor = tokens.colors.systemBackground
        appearance.titleTextAttributes = [
            .foregroundColor: tokens.colors.labelPrimary,
            .font: tokens.typography.headingSm.font()
        ]

        navigationBar.standardAppearance = appearance
        navigationBar.scrollEdgeAppearance = appearance
        navigationBar.compactAppearance = appearance

        // Configure back button style
        navigationBar.tintColor = tokens.colors.primary
        navigationBar.backItem?.title = ""
    }

}

// MARK: - UIGestureRecognizerDelegate Conformance

extension NativeNavigationController: UIGestureRecognizerDelegate {
    func gestureRecognizer(
        _ gestureRecognizer: UIGestureRecognizer,
        shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer
    ) -> Bool {
        // Only allow back gesture when there's more than one controller in stack
        return viewControllers.count > 1
    }

    func gestureRecognizer(
        _ gestureRecognizer: UIGestureRecognizer,
        shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer
    ) -> Bool {
        // Allow back gesture to work alongside other gestures
        return true
    }
}
