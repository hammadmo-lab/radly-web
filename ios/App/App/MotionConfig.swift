import UIKit

/// Unified motion and animation configuration
/// Aligned with web layer (Framer Motion) for consistent animations
struct MotionConfig {

    // MARK: - Spring Animation Constants

    /// Standard spring animation (used for most transitions)
    static let standardSpring = SpringAnimation(
        stiffness: 520,
        damping: 46,
        mass: 0.9,
        duration: 0.24
    )

    /// Quick spring animation (for faster feedback)
    static let quickSpring = SpringAnimation(
        stiffness: 600,
        damping: 60,
        mass: 0.8,
        duration: 0.18
    )

    /// Slow spring animation (for deliberate, smooth motion)
    static let slowSpring = SpringAnimation(
        stiffness: 300,
        damping: 40,
        mass: 1.0,
        duration: 0.35
    )

    // MARK: - Transition Animations

    /// Modal presentation animation
    static let modalPresentation = SpringAnimation(
        stiffness: 520,
        damping: 46,
        mass: 0.9,
        duration: 0.26
    )

    /// Modal dismissal animation
    static let modalDismissal = SpringAnimation(
        stiffness: 520,
        damping: 46,
        mass: 0.9,
        duration: 0.26
    )

    /// Navigation push animation
    static let navigationPush = SpringAnimation(
        stiffness: 520,
        damping: 46,
        mass: 0.9,
        duration: 0.24
    )

    /// Navigation pop animation
    static let navigationPop = SpringAnimation(
        stiffness: 520,
        damping: 46,
        mass: 0.9,
        duration: 0.24
    )

    // MARK: - Easing Functions

    enum Easing {
        case easeInOut
        case easeIn
        case easeOut
        case linear

        func timingFunction() -> CAMediaTimingFunction {
            switch self {
            case .easeInOut:
                return CAMediaTimingFunction(name: .easeInEaseOut)
            case .easeIn:
                return CAMediaTimingFunction(name: .easeIn)
            case .easeOut:
                return CAMediaTimingFunction(name: .easeOut)
            case .linear:
                return CAMediaTimingFunction(name: .linear)
            }
        }
    }

    // MARK: - Duration Presets

    struct Durations {
        static let instant: TimeInterval = 0.0
        static let fast: TimeInterval = 0.15
        static let base: TimeInterval = 0.24
        static let slow: TimeInterval = 0.35
        static let verySlow: TimeInterval = 0.5
    }

    // MARK: - Delay Presets

    struct Delays {
        static let none: TimeInterval = 0.0
        static let short: TimeInterval = 0.05
        static let base: TimeInterval = 0.1
        static let long: TimeInterval = 0.2
    }
}

// MARK: - Spring Animation Model

struct SpringAnimation {
    let stiffness: CGFloat
    let damping: CGFloat
    let mass: CGFloat
    let duration: TimeInterval

    /// Create UIViewPropertyAnimator from this spring config
    func animator(duration: TimeInterval? = nil) -> UIViewPropertyAnimator {
        let actualDuration = duration ?? self.duration
        return UIViewPropertyAnimator(duration: actualDuration, dampingRatio: dampingRatio)
    }

    /// Calculate damping ratio from stiffness, damping, and mass
    private var dampingRatio: CGFloat {
        let zeta = damping / (2 * sqrt(stiffness * mass))
        return min(max(zeta, 0), 1) // Clamp to 0-1
    }
}

// MARK: - Performance Monitor

class MotionPerformanceMonitor {

    static let shared = MotionPerformanceMonitor()

    private var displayLink: CADisplayLink?
    private var frameCount = 0
    private var droppedFrames = 0
    private let targetFPS: Int = 120

    private init() {}

    /// Start monitoring frame rate
    func startMonitoring() {
        displayLink = CADisplayLink(
            target: self,
            selector: #selector(onDisplayLink(_:))
        )
        displayLink?.preferredFramesPerSecond = targetFPS
        displayLink?.add(to: .main, forMode: .common)
    }

    /// Stop monitoring frame rate
    func stopMonitoring() {
        displayLink?.invalidate()
        displayLink = nil
    }

    /// Get current dropped frames count
    var droppedFrameCount: Int {
        return droppedFrames
    }

    /// Get current frame rate as percentage of target
    var frameRatePercentage: CGFloat {
        guard frameCount > 0 else { return 100 }
        return CGFloat(frameCount - droppedFrames) / CGFloat(frameCount) * 100
    }

    @objc private func onDisplayLink(_ displayLink: CADisplayLink) {
        frameCount += 1

        // Check if frame was dropped (simple heuristic)
        let expectedFrameTime = 1.0 / CGFloat(targetFPS)
        if displayLink.duration > expectedFrameTime * 1.5 {
            droppedFrames += 1
        }

        // Log every 60 frames
        if frameCount % 60 == 0 {
            notifyFrameRateStatus()
        }
    }

    private func notifyFrameRateStatus() {
        let percentage = frameRatePercentage
        NotificationCenter.default.post(
            name: NSNotification.Name(rawValue: "MotionFrameRateStatus"),
            object: nil,
            userInfo: [
                "frameRatePercentage": percentage,
                "droppedFrames": droppedFrames,
                "totalFrames": frameCount
            ]
        )
    }
}
