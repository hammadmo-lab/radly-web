import UIKit

/// Custom hosting controller that wraps CAPBridgeViewController with native enhancements
/// Note: This is a reference implementation. To use, update SceneDelegate to use this class
class NativeHostingController: UIViewController {

    private let statusBarCoordinator = StatusBarCoordinator()
    private var webViewContainer: UIView?

    override func viewDidLoad() {
        super.viewDidLoad()
        setupNativeEnhancements()
        observeThemeChanges()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        updateStatusBarStyle()
    }

    // MARK: - Private

    private func setupNativeEnhancements() {
        // Set background to match design system
        view.backgroundColor = DesignTokens.shared.colors.systemBackground

        // Safe area management would be done here when integrating with real webview
        if #available(iOS 11.0, *) {
            additionalSafeAreaInsets = UIEdgeInsets.zero
        }
    }

    private func updateStatusBarStyle() {
        statusBarCoordinator.updateStatusBar(for: self)
    }

    private func observeThemeChanges() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(themeDidChange),
            name: NSNotification.Name(rawValue: "DesignTokensDidChange"),
            object: nil
        )
    }

    @objc private func themeDidChange() {
        updateStatusBarStyle()
    }

    // MARK: - Status Bar

    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return traitCollection.userInterfaceStyle == .dark ? .lightContent : .darkContent
        }
        return .default
    }

    override var prefersStatusBarHidden: Bool {
        return false
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
