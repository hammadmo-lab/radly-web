import UIKit

/// Plugin to bridge native haptics with JavaScript layer
class HapticsBridgePlugin {

    static let shared = HapticsBridgePlugin()

    private init() {}

    // MARK: - Public Methods

    /// Trigger impact haptic feedback
    /// - Parameter style: "light", "medium", or "heavy"
    func triggerImpact(style: String) {
        let impactStyle: HapticsManager.ImpactStyle
        switch style.lowercased() {
        case "light":
            impactStyle = .light
        case "heavy":
            impactStyle = .heavy
        default:
            impactStyle = .medium
        }

        HapticsManager.shared.triggerImpact(style: impactStyle)
    }

    /// Trigger success notification haptic
    func notifySuccess() {
        HapticsManager.shared.notifySuccess()
    }

    /// Trigger warning notification haptic
    func notifyWarning() {
        HapticsManager.shared.notifyWarning()
    }

    /// Trigger error notification haptic
    func notifyError() {
        HapticsManager.shared.notifyError()
    }

    /// Trigger selection changed haptic
    func notifySelectionChanged() {
        HapticsManager.shared.notifySelectionChanged()
    }
}
