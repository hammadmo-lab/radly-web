/**
 * RevenueCat Service
 *
 * Manages in-app purchases and subscriptions via RevenueCat SDK
 * for iOS and Android platforms.
 *
 * Features:
 * - Platform-specific API key configuration
 * - Purchase flow management
 * - Subscription status checking
 * - Restore purchases
 * - Offering/package retrieval
 */

import { Purchases, LOG_LEVEL, type CustomerInfo, type PurchasesOfferings, type PurchasesPackage } from '@revenuecat/purchases-capacitor'
import { getPlatform } from './platform'

/**
 * RevenueCat configuration
 */
const REVENUECAT_CONFIG = {
  ios: {
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || '',
  },
  android: {
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || '',
  },
  // Enable debug logging in development
  logLevel: process.env.NODE_ENV === 'development' ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO,
}

/**
 * Product ID mappings (must match RevenueCat dashboard configuration)
 */
export const REVENUECAT_PRODUCTS = {
  starter: {
    monthly: 'radly_starter_monthly',
    yearly: 'radly_starter_yearly',
  },
  professional: {
    monthly: 'radly_professional_monthly',
    yearly: 'radly_professional_yearly',
  },
  premium: {
    monthly: 'radly_premium_monthly',
    yearly: 'radly_premium_yearly',
  },
} as const

/**
 * Entitlement identifiers (must match RevenueCat dashboard)
 */
export const REVENUECAT_ENTITLEMENTS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  PREMIUM: 'premium',
} as const

/**
 * Initialize RevenueCat SDK
 *
 * Call this once when the app starts on a native platform.
 * Uses platform-specific API keys.
 *
 * @param userId - Optional user ID to identify the subscriber
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  const platform = getPlatform()

  // Only initialize on native platforms
  if (platform === 'web') {
    console.log('[RevenueCat] Skipping initialization on web platform')
    return
  }

  try {
    const apiKey = platform === 'ios'
      ? REVENUECAT_CONFIG.ios.apiKey
      : REVENUECAT_CONFIG.android.apiKey

    if (!apiKey) {
      console.error(`[RevenueCat] Missing API key for ${platform}`)
      return
    }

    // Configure RevenueCat
    await Purchases.configure({
      apiKey,
      appUserID: userId, // Optional: links purchases to your user ID
    })

    // Set log level
    await Purchases.setLogLevel({ level: REVENUECAT_CONFIG.logLevel })

    console.log(`[RevenueCat] Initialized for ${platform}`, userId ? `with user: ${userId}` : '')
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error)
    throw error
  }
}

/**
 * Get current customer info (subscription status, entitlements, etc.)
 *
 * @returns CustomerInfo object with subscription details
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error)
    throw error
  }
}

/**
 * Get available offerings and packages
 *
 * Offerings are configured in RevenueCat dashboard and contain
 * packages (subscription products) that users can purchase.
 *
 * @returns Offerings with available packages
 */
export async function getOfferings(): Promise<PurchasesOfferings> {
  try {
    const result = await Purchases.getOfferings()
    return result
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error)
    throw error
  }
}

/**
 * Purchase a package
 *
 * @param packageToPurchase - The package to purchase (from offerings)
 * @returns Updated customer info after purchase
 */
export async function purchasePackage(packageToPurchase: unknown): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase as PurchasesPackage,
    })

    console.log('[RevenueCat] Purchase successful:', customerInfo)
    return customerInfo
  } catch (error) {
    // User cancelled purchase
    if (typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled) {
      console.log('[RevenueCat] Purchase cancelled by user')
      throw new Error('PURCHASE_CANCELLED')
    }

    console.error('[RevenueCat] Purchase failed:', error)
    throw error
  }
}

/**
 * Restore previous purchases
 *
 * Use this when user signs in on a new device or reinstalls the app.
 *
 * @returns Restored customer info
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    console.log('[RevenueCat] Purchases restored:', customerInfo)
    return customerInfo
  } catch (error) {
    console.error('[RevenueCat] Failed to restore purchases:', error)
    throw error
  }
}

/**
 * Check if user has an active entitlement
 *
 * @param entitlementId - The entitlement identifier to check
 * @returns True if user has active entitlement
 */
export async function hasActiveEntitlement(entitlementId: string): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo()
    const entitlement = customerInfo.entitlements.active[entitlementId]
    return entitlement !== undefined && entitlement !== null
  } catch (error) {
    console.error('[RevenueCat] Failed to check entitlement:', error)
    return false
  }
}

/**
 * Get user's current subscription tier
 *
 * Maps RevenueCat entitlements to Radly subscription tiers.
 * Priority: premium > professional > starter > free
 *
 * @returns Subscription tier name
 */
export async function getCurrentTier(): Promise<'free' | 'starter' | 'professional' | 'premium'> {
  try {
    const customerInfo = await getCustomerInfo()
    const activeEntitlements = customerInfo.entitlements.active

    // Check in priority order
    if (activeEntitlements[REVENUECAT_ENTITLEMENTS.PREMIUM]) {
      return 'premium'
    }
    if (activeEntitlements[REVENUECAT_ENTITLEMENTS.PROFESSIONAL]) {
      return 'professional'
    }
    if (activeEntitlements[REVENUECAT_ENTITLEMENTS.STARTER]) {
      return 'starter'
    }

    return 'free'
  } catch (error) {
    console.error('[RevenueCat] Failed to get tier:', error)
    return 'free'
  }
}

/**
 * Identify user with RevenueCat
 *
 * Links anonymous user to a known user ID (e.g., after login)
 *
 * @param userId - Your app's user ID
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn({ appUserID: userId })
    console.log('[RevenueCat] User identified:', userId)
  } catch (error) {
    console.error('[RevenueCat] Failed to identify user:', error)
    throw error
  }
}

/**
 * Log out current user
 *
 * Switches back to anonymous user
 */
export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut()
    console.log('[RevenueCat] User logged out')
  } catch (error) {
    console.error('[RevenueCat] Failed to log out:', error)
    throw error
  }
}

/**
 * Set user attributes
 *
 * Use for analytics and targeting (e.g., email, name)
 *
 * @param attributes - Key-value pairs of user attributes
 */
export async function setUserAttributes(attributes: Record<string, string | null>): Promise<void> {
  try {
    // Convert attributes to the format expected by Purchases.setAttributes
    // which expects key-value pairs as separate parameters
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null) {
        Purchases.setAttributes({ [key]: value })
      }
    })
    console.log('[RevenueCat] User attributes set')
  } catch (error) {
    console.error('[RevenueCat] Failed to set attributes:', error)
  }
}
