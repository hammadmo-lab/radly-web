import UIKit
import Capacitor

@objc(MainViewController)
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(RadlyGoogleAuth())
        print("🔵 RadlyGoogleAuth plugin registered!")
    }
}
