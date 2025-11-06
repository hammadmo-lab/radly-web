import UIKit
import Foundation

/// Centralized design tokens for iOS app, synced with web design system
struct DesignTokens {
    static let shared = DesignTokens()

    // MARK: - Colors
    struct Colors {
        let systemBackground = UIColor(hex: "#FFFFFF")
        let secondarySystemBackground = UIColor(hex: "#F9FAFB")
        let tertiarySystemBackground = UIColor(hex: "#F3F4F6")

        let labelPrimary = UIColor(hex: "#111827")
        let labelSecondary = UIColor(hex: "#4B5563")
        let labelTertiary = UIColor(hex: "#9CA3AF")

        let separator = UIColor(hex: "#E5E7EB")
        let opaqueSeparator = UIColor(hex: "#D1D5DB")

        // Brand colors
        let primary = UIColor(hex: "#2653FF")
        let primaryLight = UIColor(hex: "#4B8EFF")
        let primaryGradientEnd = UIColor(hex: "#8F82FF")

        let success = UIColor(hex: "#3FBF8C")
        let error = UIColor(hex: "#FF6B6B")
        let warning = UIColor(hex: "#F8B74D")

        // Dark mode variants
        let darkSystemBackground = UIColor(hex: "#0F172A")
        let darkLabelPrimary = UIColor(hex: "#F8FAFC")
        let darkLabelSecondary = UIColor(hex: "#CBD5E1")
    }

    // MARK: - Typography
    struct Typography {
        let headingLg = FontConfig(name: "Inter-SemiBold", size: 28, lineHeight: 34)
        let headingMd = FontConfig(name: "Inter-SemiBold", size: 22, lineHeight: 28)
        let headingSm = FontConfig(name: "Inter-SemiBold", size: 18, lineHeight: 24)

        let bodyLarge = FontConfig(name: "Inter-Regular", size: 17, lineHeight: 24)
        let body = FontConfig(name: "Inter-Regular", size: 16, lineHeight: 22)
        let bodySmall = FontConfig(name: "Inter-Regular", size: 14, lineHeight: 20)

        let caption = FontConfig(name: "Inter-Regular", size: 12, lineHeight: 16)
    }

    // MARK: - Spacing & Radii
    struct Layout {
        let spacing4: CGFloat = 4
        let spacing8: CGFloat = 8
        let spacing12: CGFloat = 12
        let spacing16: CGFloat = 16
        let spacing20: CGFloat = 20
        let spacing24: CGFloat = 24
        let spacing32: CGFloat = 32

        let radiusSmall: CGFloat = 8
        let radiusMedium: CGFloat = 12
        let radiusLarge: CGFloat = 16
        let radiusXL: CGFloat = 20
        let radiusFull: CGFloat = 9999
    }

    // MARK: - Shadow
    struct Shadows {
        static let small = NSShadow(offset: CGSize(width: 0, height: 1), blur: 2, color: UIColor.black.withAlphaComponent(0.05))
        static let medium = NSShadow(offset: CGSize(width: 0, height: 4), blur: 6, color: UIColor.black.withAlphaComponent(0.1))
        static let large = NSShadow(offset: CGSize(width: 0, height: 10), blur: 15, color: UIColor.black.withAlphaComponent(0.15))
    }

    let colors = Colors()
    let typography = Typography()
    let layout = Layout()

    private init() {}
}

// MARK: - Font Configuration
struct FontConfig {
    let name: String
    let size: CGFloat
    let lineHeight: CGFloat

    func font() -> UIFont {
        if let customFont = UIFont(name: name, size: size) {
            return customFont
        }
        // Fallback to system font
        return UIFont.systemFont(ofSize: size, weight: fontWeight())
    }

    private func fontWeight() -> UIFont.Weight {
        if name.contains("SemiBold") {
            return .semibold
        } else if name.contains("Bold") {
            return .bold
        } else if name.contains("Light") {
            return .light
        }
        return .regular
    }
}

// MARK: - UIColor extension for hex colors
extension UIColor {
    convenience init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)

        let r = CGFloat((rgb >> 16) & 0xff) / 255
        let g = CGFloat((rgb >> 8) & 0xff) / 255
        let b = CGFloat((rgb >> 0) & 0xff) / 255

        self.init(red: r, green: g, blue: b, alpha: 1)
    }
}

// MARK: - NSShadow extension
extension NSShadow {
    convenience init(offset: CGSize, blur: CGFloat, color: UIColor) {
        self.init()
        self.shadowOffset = offset
        self.shadowBlurRadius = blur
        self.shadowColor = color
    }
}
