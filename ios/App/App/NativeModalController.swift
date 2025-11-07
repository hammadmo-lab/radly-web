import UIKit

/// Custom modal view controller with blur effect and swipe-to-dismiss
class NativeModalController: UIViewController {

    private let blurView = UIVisualEffectView(effect: UIBlurEffect(style: .systemChromeMaterial))
    private var animator: UIViewPropertyAnimator?
    private var panGestureRecognizer: UIPanGestureRecognizer?
    private var initialFrame: CGRect = .zero

    override func viewDidLoad() {
        super.viewDidLoad()
        setupBlurBackground()
        setupPanGesture()
        configureModalPresentation()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        animatePresentation()
    }

    // MARK: - Setup

    private func setupBlurBackground() {
        blurView.frame = view.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(blurView)
        view.sendSubviewToBack(blurView)

        // Set background to semi-transparent
        view.backgroundColor = UIColor.black.withAlphaComponent(0.3)
    }

    private func setupPanGesture() {
        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        view.addGestureRecognizer(panGesture)
        panGestureRecognizer = panGesture
    }

    private func configureModalPresentation() {
        // Configure as sheet
        if #available(iOS 15.0, *) {
            if let sheet = sheetPresentationController {
                sheet.detents = [.medium(), .large()]
                sheet.prefersGrabberVisible = true
                sheet.preferredCornerRadius = DesignTokens.shared.layout.radiusLarge
            }
        }
    }

    // MARK: - Animations

    private func animatePresentation() {
        let duration: TimeInterval = 0.26
        let dampingRatio: CGFloat = 0.86

        animator = UIViewPropertyAnimator(duration: duration, dampingRatio: dampingRatio) {
            self.blurView.alpha = 1.0
        }
        animator?.startAnimation()
    }

    private func animateDismissal(velocity: CGFloat = 0) {
        let duration: TimeInterval = 0.26
        let dampingRatio: CGFloat = 0.86

        animator = UIViewPropertyAnimator(duration: duration, dampingRatio: dampingRatio) {
            self.blurView.alpha = 0.0
            self.view.transform = CGAffineTransform(translationX: 0, y: self.view.bounds.height)
        }

        animator?.addCompletion { [weak self] position in
            if position == .end {
                self?.dismiss(animated: false)
            }
        }

        animator?.startAnimation()
    }

    // MARK: - Pan Gesture

    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: view)
        let percent = translation.y / view.bounds.height

        switch gesture.state {
        case .began:
            initialFrame = view.frame
            animator = UIViewPropertyAnimator(duration: 0.26, dampingRatio: 0.86) {
                self.view.transform = CGAffineTransform(translationX: 0, y: max(0, translation.y))
            }

        case .changed:
            animator?.fractionComplete = percent

        case .cancelled, .failed:
            animator?.isReversed = true
            animator?.startAnimation()

        case .ended:
            let velocity = gesture.velocity(in: view).y
            if percent > 0.1 || velocity > 1000 {
                animateDismissal(velocity: velocity)
            } else {
                animator?.isReversed = true
                animator?.startAnimation()
            }

        case .possible:
            break

        @unknown default:
            break
        }
    }

    // MARK: - Public Methods

    /// Present the modal with animation
    func presentModally(from viewController: UIViewController, animated: Bool = true) {
        modalPresentationStyle = .pageSheet
        viewController.present(self, animated: animated)
    }

    /// Dismiss the modal with animation
    func dismissModally(animated: Bool = true) {
        animateDismissal()
    }
}
