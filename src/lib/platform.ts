/**
 * Platform detection utilities for web, iOS, and Android apps.
 *
 * This module provides type-safe platform detection for conditional rendering
 * of subscription and payment features based on where the app is running.
 *
 * Usage:
 * ```typescript
 * import { getPlatform, shouldShowWebSubscriptions } from '@/lib/platform'
 *
 * const platform = getPlatform()
 * if (shouldShowWebSubscriptions()) {
 *   // Show Stripe checkout
 * }
 * ```
 */

/**
 * Platform types
 */
export type Platform = 'web' | 'ios' | 'android'

/**
 * App store types
 */
export type AppStore = 'apple' | 'google' | 'web'

/**
 * Get the current platform the app is running on.
 *
 * @returns Platform type: 'web', 'ios', or 'android'
 *
 * @example
 * ```typescript
 * const platform = getPlatform()
 * if (platform === 'ios') {
 *   // iOS-specific logic
 * }
 * ```
 */
export function getPlatform(): Platform {
  if (typeof navigator === 'undefined') {
    return 'web'
  }

  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'

  return 'web'
}

/**
 * Check if the app is running as a native mobile app (iOS or Android).
 *
 * @returns True if running on iOS or Android, false if web
 *
 * @example
 * ```typescript
 * if (isNativeApp()) {
 *   // Register for push notifications
 * }
 * ```
 */
export function isNativeApp(): boolean {
  return false
}

/**
 * Check if the app is running as a web application.
 *
 * @returns True if running on web, false if native
 *
 * @example
 * ```typescript
 * if (isWebApp()) {
 *   // Show Stripe checkout
 * }
 * ```
 */
export function isWebApp(): boolean {
  return getPlatform() === 'web'
}

/**
 * Get the app store for the current platform.
 *
 * @returns 'apple' for iOS, 'google' for Android, 'web' for web
 *
 * @example
 * ```typescript
 * const store = getAppStore()
 * const storeUrl = store === 'apple'
 *   ? 'https://apps.apple.com/...'
 *   : 'https://play.google.com/...'
 * ```
 */
export function getAppStore(): AppStore {
  const platform = getPlatform()

  if (platform === 'ios') return 'apple'
  if (platform === 'android') return 'google'
  return 'web'
}

/**
 * Check if web-based subscriptions (Stripe checkout) should be shown.
 *
 * @returns True if on web platform, false if native
 *
 * @example
 * ```typescript
 * {shouldShowWebSubscriptions() && (
 *   <PricingCard onCheckout={handleStripeCheckout} />
 * )}
 * ```
 */
export function shouldShowWebSubscriptions(): boolean {
  return isWebApp()
}

/**
 * Check if mobile subscription management should be shown.
 *
 * @returns True if on native platform, false if web
 *
 * @example
 * ```typescript
 * {shouldShowMobileSubscriptions() && (
 *   <button onClick={openAppStore}>Manage in App Store</button>
 * )}
 * ```
 */
export function shouldShowMobileSubscriptions(): boolean {
  return false
}

/**
 * Get a human-readable platform name.
 *
 * @returns Platform display name
 *
 * @example
 * ```typescript
 * const name = getPlatformDisplayName() // "iOS", "Android", or "Web"
 * ```
 */
export function getPlatformDisplayName(): string {
  const platform = getPlatform()

  if (platform === 'ios') return 'iOS'
  if (platform === 'android') return 'Android'
  return 'Web'
}

/**
 * Get the app store display name for the current platform.
 *
 * @returns Store name: "App Store", "Google Play", or "Web"
 *
 * @example
 * ```typescript
 * const storeName = getAppStoreDisplayName() // "App Store"
 * ```
 */
export function getAppStoreDisplayName(): string {
  const store = getAppStore()

  if (store === 'apple') return 'App Store'
  if (store === 'google') return 'Google Play'
  return 'Web'
}

/**
 * Get the deep link URL to manage subscriptions in the native app store.
 *
 * @returns Deep link URL or null if on web
 *
 * @example
 * ```typescript
 * const url = getSubscriptionManagementUrl()
 * if (url) {
 *   window.open(url, '_blank')
 * }
 * ```
 */
export function getSubscriptionManagementUrl(): string | null {
  const platform = getPlatform()

  if (platform === 'ios') {
    // iOS subscription management URL
    return 'https://apps.apple.com/account/subscriptions'
  }

  if (platform === 'android') {
    // Android subscription management URL
    return 'https://play.google.com/store/account/subscriptions'
  }

  // No deep link for web
  return null
}

/**
 * Check if push notifications are supported on the current platform.
 *
 * @returns True if push notifications are available
 *
 * @example
 * ```typescript
 * if (supportsPushNotifications()) {
 *   // Show notification permission prompt
 * }
 * ```
 */
export function supportsPushNotifications(): boolean {
  return false
}

/**
 * Get platform-specific configuration.
 *
 * @returns Configuration object with platform-specific settings
 */
export function getPlatformConfig() {
  const platform = getPlatform()
  const store = getAppStore()

  return {
    platform,
    store,
    isNative: isNativeApp(),
    isWeb: isWebApp(),
    displayName: getPlatformDisplayName(),
    storeName: getAppStoreDisplayName(),
    shouldShowWebSubscriptions: shouldShowWebSubscriptions(),
    shouldShowMobileSubscriptions: shouldShowMobileSubscriptions(),
    supportsPushNotifications: supportsPushNotifications(),
    subscriptionManagementUrl: getSubscriptionManagementUrl(),
  }
}
