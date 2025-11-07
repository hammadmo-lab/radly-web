import UIKit
import Capacitor
import WebKit
import AVFoundation

@main
class AppDelegate: UIResponder, UIApplicationDelegate, WKUIDelegate {
  var window: UIWindow?
  private var didAttachUIDelegate = false

  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let session = AVAudioSession.sharedInstance()
    try? session.setCategory(.playAndRecord, options: [.defaultToSpeaker, .allowBluetoothHFP])
    try? session.setActive(true)
    return true
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    if !didAttachUIDelegate,
       let vc = self.window?.rootViewController as? CAPBridgeViewController {
      vc.webView?.uiDelegate = self
      didAttachUIDelegate = true
    }
  }

  @available(iOS 15.0, *)
  func webView(_ webView: WKWebView,
               requestMediaCapturePermissionFor origin: WKSecurityOrigin,
               initiatedByFrame frame: WKFrameInfo,
               type: WKMediaCaptureType,
               decisionHandler: @escaping (WKPermissionDecision) -> Void) {
    if type == .microphone || type == .cameraAndMicrophone {
      AVAudioSession.sharedInstance().requestRecordPermission { granted in
        DispatchQueue.main.async { decisionHandler(granted ? .grant : .deny) }
      }
    } else {
      decisionHandler(.grant)
    }
  }

  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
  }

  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return ApplicationDelegateProxy.shared.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
}
