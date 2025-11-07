import UIKit

/// Manages haptic feedback for user interactions
class HapticsManager {

    static let shared = HapticsManager()

    private var lastHapticTime: TimeInterval = 0
    private let hapticDebounceInterval: TimeInterval = 0.1

    private init() {}

    // MARK: - Impact Feedback

    /// Trigger impact haptic feedback
    func triggerImpact(style: ImpactStyle = .medium) {
        guard shouldTriggerHaptic() else { return }

        let feedbackStyle: UIImpactFeedbackGenerator.FeedbackStyle
        switch style {
        case .light:
            feedbackStyle = .light
        case .medium:
            feedbackStyle = .medium
        case .heavy:
            feedbackStyle = .heavy
        }

        let generator = UIImpactFeedbackGenerator(style: feedbackStyle)
        generator.impactOccurred()
    }

    // MARK: - Notification Feedback

    /// Trigger notification haptic feedback for success
    func notifySuccess() {
        guard shouldTriggerHaptic() else { return }

        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }

    /// Trigger notification haptic feedback for warning
    func notifyWarning() {
        guard shouldTriggerHaptic() else { return }

        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.warning)
    }

    /// Trigger notification haptic feedback for error
    func notifyError() {
        guard shouldTriggerHaptic() else { return }

        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
    }

    // MARK: - Selection Feedback

    /// Trigger selection change haptic feedback
    func notifySelectionChanged() {
        guard shouldTriggerHaptic() else { return }

        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }

    // MARK: - Debouncing

    private func shouldTriggerHaptic() -> Bool {
        let now = Date().timeIntervalSince1970
        if now - lastHapticTime >= hapticDebounceInterval {
            lastHapticTime = now
            return true
        }
        return false
    }

    // MARK: - Types

    enum ImpactStyle {
        case light
        case medium
        case heavy
    }
}
