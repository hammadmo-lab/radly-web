import UIKit

/// Handles custom modal presentation and dismissal transitions
class ModalTransitioningDelegate: NSObject, UIViewControllerTransitioningDelegate {

    func presentationController(
        forPresented presented: UIViewController,
        presenting: UIViewController?,
        source: UIViewController
    ) -> UIPresentationController? {
        return ModalPresentationController(
            presentedViewController: presented,
            presenting: presenting
        )
    }

    func animationController(
        forPresented presented: UIViewController,
        presenting: UIViewController,
        source: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return ModalPresentationAnimator(isPresenting: true)
    }

    func animationController(
        forDismissed dismissed: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        return ModalPresentationAnimator(isPresenting: false)
    }
}

// MARK: - Presentation Controller

class ModalPresentationController: UIPresentationController {

    private let dimmingView = UIView()

    override var frameOfPresentedViewInContainerView: CGRect {
        guard let containerView = containerView else { return .zero }

        let height = containerView.bounds.height * 0.7
        let y = containerView.bounds.height - height

        return CGRect(
            x: 0,
            y: y,
            width: containerView.bounds.width,
            height: height
        )
    }

    override func presentationTransitionWillBegin() {
        guard let containerView = containerView else { return }

        // Setup dimming view
        dimmingView.frame = containerView.bounds
        dimmingView.backgroundColor = UIColor.black.withAlphaComponent(0)
        containerView.insertSubview(dimmingView, belowSubview: presentedView!)

        // Animate dimming
        presentedViewController.transitionCoordinator?.animate(alongsideTransition: { _ in
            self.dimmingView.backgroundColor = UIColor.black.withAlphaComponent(0.3)
        })
    }

    override func dismissalTransitionWillBegin() {
        presentedViewController.transitionCoordinator?.animate(alongsideTransition: { _ in
            self.dimmingView.backgroundColor = UIColor.black.withAlphaComponent(0)
        })
    }
}

// MARK: - Animated Transitioning

class ModalPresentationAnimator: NSObject, UIViewControllerAnimatedTransitioning {

    let isPresenting: Bool
    let duration: TimeInterval = 0.26
    let dampingRatio: CGFloat = 0.86

    init(isPresenting: Bool) {
        self.isPresenting = isPresenting
        super.init()
    }

    func transitionDuration(using transitionContext: UIViewControllerContextTransitioning?) -> TimeInterval {
        return duration
    }

    func animateTransition(using transitionContext: UIViewControllerContextTransitioning) {
        if isPresenting {
            animatePresentation(using: transitionContext)
        } else {
            animateDismissal(using: transitionContext)
        }
    }

    private func animatePresentation(using transitionContext: UIViewControllerContextTransitioning) {
        guard let toViewController = transitionContext.viewController(forKey: .to),
              let toView = transitionContext.view(forKey: .to) else {
            transitionContext.completeTransition(false)
            return
        }

        // Start position (off-screen bottom)
        toView.frame.origin.y = transitionContext.containerView.bounds.height

        // Animate to final position
        let animator = UIViewPropertyAnimator(
            duration: duration,
            dampingRatio: dampingRatio
        ) {
            toView.frame.origin.y = transitionContext.finalFrame(for: toViewController).origin.y
        }

        animator.addCompletion { position in
            transitionContext.completeTransition(position == UIViewAnimatingPosition.end)
        }

        animator.startAnimation()
    }

    private func animateDismissal(using transitionContext: UIViewControllerContextTransitioning) {
        guard let fromView = transitionContext.view(forKey: .from) else {
            transitionContext.completeTransition(false)
            return
        }

        // Animate to off-screen bottom
        let animator = UIViewPropertyAnimator(
            duration: duration,
            dampingRatio: dampingRatio
        ) {
            fromView.frame.origin.y = transitionContext.containerView.bounds.height
        }

        animator.addCompletion { position in
            transitionContext.completeTransition(position == UIViewAnimatingPosition.end)
        }

        animator.startAnimation()
    }
}
