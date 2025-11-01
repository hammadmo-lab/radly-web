import Foundation
import Capacitor
import GoogleSignIn
import Security
import CryptoKit

@objc(RadlyGoogleAuth)
public class RadlyGoogleAuth: CAPPlugin {

    @objc func signIn(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.performSignIn(call)
        }
    }

    @objc func signOut(_ call: CAPPluginCall) {
        GIDSignIn.sharedInstance.signOut()
        call.resolve()
    }

    private func performSignIn(_ call: CAPPluginCall) {
        guard let presentingVC = bridge?.viewController else {
            reject(call, message: "No presenting view controller")
            return
        }

        let config = GIDConfiguration(
            clientID: "590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo.apps.googleusercontent.com",
            serverClientID: "590422684479-qjrih3fq3086o3qj0maj0lnf9m0.apps.googleusercontent.com"
        )

        GIDSignIn.sharedInstance.signOut()
        GIDSignIn.sharedInstance.configuration = config

        let nonce = randomNonceString()
        let nonceHash = sha256(nonce)

        GIDSignIn.sharedInstance.signIn(withPresenting: presentingVC,
                                        hint: nil,
                                        additionalScopes: nil,
                                        nonce: nonceHash,
                                        completion: { result, error in
            if let error = error {
                self.reject(call, message: "Google sign-in error: \(error.localizedDescription)")
                return
            }

            guard let user = result?.user else {
                self.reject(call, message: "No Google user found")
                return
            }

            user.refreshTokensIfNeeded { refreshedUser, refreshError in
                if let refreshError = refreshError {
                    self.reject(call, message: "Token refresh error: \(refreshError.localizedDescription)")
                    return
                }

                let tokenUser = refreshedUser ?? user

                var response: [String: Any] = [:]

                if let idTokenString = tokenUser.idToken?.tokenString, !idTokenString.isEmpty {
                    response["idToken"] = idTokenString
                }

                let accessTokenString = tokenUser.accessToken.tokenString
                if !accessTokenString.isEmpty {
                    response["accessToken"] = accessTokenString
                }

                let refreshTokenString = tokenUser.refreshToken.tokenString
                if !refreshTokenString.isEmpty {
                    response["refreshToken"] = refreshTokenString
                }

                if let email = tokenUser.profile?.email {
                    response["email"] = email
                }

                if let familyName = tokenUser.profile?.familyName {
                    response["familyName"] = familyName
                }

                if let givenName = tokenUser.profile?.givenName {
                    response["givenName"] = givenName
                }

                if let displayName = tokenUser.profile?.name {
                    response["displayName"] = displayName
                }

                if let imageUrl = tokenUser.profile?.imageURL(withDimension: 200)?.absoluteString {
                    response["imageUrl"] = imageUrl
                }

                response["nonce"] = nonce

                guard response["idToken"] != nil else {
                    self.reject(call, message: "Google ID token not found")
                    return
                }

                self.resolve(call, data: response)
            }
        })
    }

    private func resolve(_ call: CAPPluginCall, data: [String: Any]) {
        if Thread.isMainThread {
            call.resolve(data)
        } else {
            DispatchQueue.main.async {
                call.resolve(data)
            }
        }
    }

    private func reject(_ call: CAPPluginCall, message: String) {
        if Thread.isMainThread {
            call.reject(message)
        } else {
            DispatchQueue.main.async {
                call.reject(message)
            }
        }
    }

    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            var randoms = [UInt8](repeating: 0, count: 16)
            let status = SecRandomCopyBytes(kSecRandomDefault, randoms.count, &randoms)
            if status != errSecSuccess {
                fatalError("Unable to generate nonce. SecRandomCopyBytes failed with status \(status)")
            }

            randoms.forEach { random in
                if remainingLength == 0 {
                    return
                }

                if random < charset.count {
                    result.append(charset[Int(random)])
                    remainingLength -= 1
                }
            }
        }

        return result
    }

    private func sha256(_ value: String) -> String {
        let inputData = Data(value.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }
}
