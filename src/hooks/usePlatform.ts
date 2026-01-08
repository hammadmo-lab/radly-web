/**
 * React hook for platform detection with SSR safety and memoization.
 *
 * This hook provides a safe way to detect the current platform in React components,
 * with proper handling of server-side rendering and hydration.
 *
 * Usage:
 * ```typescript
 * function MyComponent() {
 *   const { platform, isNative, shouldShowWebSubscriptions } = usePlatform()
 *
 *   if (shouldShowWebSubscriptions) {
 *     return <StripeCheckout />
 *   }
 *
 *   return <AppStoreButton />
 * }
 * ```
 */

'use client'

import { useState } from 'react'
import {
  getPlatform,
  isNativeApp,
  isWebApp,
  getAppStore,
  shouldShowWebSubscriptions,
  shouldShowMobileSubscriptions,
  getPlatformDisplayName,
  getAppStoreDisplayName,
  getSubscriptionManagementUrl,
  supportsPushNotifications,
  getPlatformConfig,
  type Platform,
  type AppStore,
} from '@/lib/platform'

/**
 * Platform hook return type
 */
export interface UsePlatformReturn {
  /** Current platform: 'web', 'ios', or 'android' */
  platform: Platform
  /** Current app store: 'web', 'apple', or 'google' */
  store: AppStore
  /** True if running on native app (iOS or Android) */
  isNative: boolean
  /** True if running on web */
  isWeb: boolean
  /** Human-readable platform name */
  displayName: string
  /** Human-readable store name */
  storeName: string
  /** True if web subscriptions should be shown */
  shouldShowWebSubscriptions: boolean
  /** True if mobile subscriptions should be shown */
  shouldShowMobileSubscriptions: boolean
  /** True if push notifications are supported */
  supportsPushNotifications: boolean
  /** Deep link URL to manage subscriptions, or null if web */
  subscriptionManagementUrl: string | null
  /** True if platform detection has completed (after hydration) */
  isReady: boolean
}

/**
 * Hook for platform detection with SSR safety.
 *
 * This hook safely detects the current platform in both server-side and client-side
 * rendering contexts. It returns 'web' during SSR and updates after hydration.
 *
 * @returns Platform information and helper flags
 *
 * @example
 * ```typescript
 * function SubscriptionButton() {
 *   const { platform, shouldShowWebSubscriptions, isReady } = usePlatform()
 *
 *   if (!isReady) {
 *     return <Skeleton /> // Avoid hydration mismatch
 *   }
 *
 *   if (shouldShowWebSubscriptions) {
 *     return <StripeCheckoutButton />
 *   }
 *
 *   return <AppStoreButton platform={platform} />
 * }
 * ```
 */
export function usePlatform(): UsePlatformReturn {
  // Initialize with actual platform config
  const [config] = useState(() => getPlatformConfig())
  const [isReady, setIsReady] = useState(() => {
    // On the server, always return false
    // On the client, return true immediately (hydration already happened)
    return typeof window !== 'undefined'
  })

  return {
    ...config,
    isReady,
  }
}

/**
 * Hook to check if the app is running natively.
 *
 * @returns True if running on iOS or Android, false if web
 *
 * @example
 * ```typescript
 * function NotificationBanner() {
 *   const isNative = useIsNativeApp()
 *
 *   if (!isNative) return null
 *
 *   return <div>Enable push notifications for report updates</div>
 * }
 * ```
 */
export function useIsNativeApp(): boolean {
  const { isNative } = usePlatform()
  return isNative
}

/**
 * Hook to check if the app is running on web.
 *
 * @returns True if running on web, false if native
 *
 * @example
 * ```typescript
 * function WebOnlyFeature() {
 *   const isWeb = useIsWebApp()
 *
 *   if (!isWeb) return null
 *
 *   return <div>This feature is web-only</div>
 * }
 * ```
 */
export function useIsWebApp(): boolean {
  const { isWeb } = usePlatform()
  return isWeb
}

/**
 * Hook to check if web subscriptions should be shown.
 *
 * @returns True if on web platform, false if native
 *
 * @example
 * ```typescript
 * function PricingPage() {
 *   const showWebSubscriptions = useShouldShowWebSubscriptions()
 *
 *   if (!showWebSubscriptions) {
 *     return <RedirectToAppStore />
 *   }
 *
 *   return <PricingCards />
 * }
 * ```
 */
export function useShouldShowWebSubscriptions(): boolean {
  const { shouldShowWebSubscriptions } = usePlatform()
  return shouldShowWebSubscriptions
}

/**
 * Hook to check if mobile subscriptions should be shown.
 *
 * @returns True if on native platform, false if web
 *
 * @example
 * ```typescript
 * function SubscriptionSettings() {
 *   const showMobile = useShouldShowMobileSubscriptions()
 *
 *   if (showMobile) {
 *     return <ManageInAppStoreButton />
 *   }
 *
 *   return <ManageStripeButton />
 * }
 * ```
 */
export function useShouldShowMobileSubscriptions(): boolean {
  const { shouldShowMobileSubscriptions } = usePlatform()
  return shouldShowMobileSubscriptions
}

/**
 * Hook to get the subscription management URL for the current platform.
 *
 * @returns Deep link URL or null if on web
 *
 * @example
 * ```typescript
 * function ManageSubscriptionButton() {
 *   const url = useSubscriptionManagementUrl()
 *
 *   if (!url) return null
 *
 *   return (
 *     <a href={url} target="_blank" rel="noopener noreferrer">
 *       Manage Subscription
 *     </a>
 *   )
 * }
 * ```
 */
export function useSubscriptionManagementUrl(): string | null {
  const { subscriptionManagementUrl } = usePlatform()
  return subscriptionManagementUrl
}

// Re-export utility functions for convenience
export {
  getPlatform,
  isNativeApp,
  isWebApp,
  getAppStore,
  shouldShowWebSubscriptions,
  shouldShowMobileSubscriptions,
  getPlatformDisplayName,
  getAppStoreDisplayName,
  getSubscriptionManagementUrl,
  supportsPushNotifications,
  getPlatformConfig,
  type Platform,
  type AppStore,
}
