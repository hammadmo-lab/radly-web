/**
 * Mobile Subscriptions API Client
 *
 * Handles API calls for mobile in-app purchases (iOS App Store and Google Play).
 * Integrates with backend endpoints documented in API_MOBILE_SUBSCRIPTIONS.md
 */

import { httpGet, httpPost, httpPut } from './http'

// ============================================================================
// Types
// ============================================================================

export type Platform = 'ios' | 'android' | 'web'

export interface MobileSubscription {
  subscription_id: string
  platform: Platform
  tier_name: string
  tier_display_name: string
  status: 'active' | 'cancelled' | 'expired' | 'grace_period' | 'pending'
  status_label: string
  expires_at: string
  auto_renew: boolean
  reports_limit: number
  reports_used: number
  reports_remaining: number
  transaction_id?: string
  days_until_expiration?: number
}

export interface SubscriptionStatus {
  active_subscriptions: MobileSubscription[]
  current_tier: MobileSubscription
}

// ============================================================================
// Apple App Store
// ============================================================================

export interface AppleVerifyRequest {
  receipt_data: string
  product_id: string
  transaction_id?: string
}

export interface AppleVerifyResponse {
  success: boolean
  message: string
  subscription: MobileSubscription
}

/**
 * Verify an Apple App Store receipt
 *
 * @param receipt_data - Base64-encoded receipt from StoreKit
 * @param product_id - Product ID (e.g., 'radly_professional_monthly')
 * @param transaction_id - Optional transaction ID
 */
export async function verifyAppleReceipt(
  receipt_data: string,
  product_id: string,
  transaction_id?: string
): Promise<AppleVerifyResponse> {
  const response = await httpPost<AppleVerifyRequest, AppleVerifyResponse>(
    '/v1/subscriptions/apple/verify',
    {
      receipt_data,
      product_id,
      transaction_id,
    }
  )
  return response
}

// ============================================================================
// Google Play Store
// ============================================================================

export interface GoogleVerifyRequest {
  purchase_token: string
  product_id: string
  subscription_id?: string
}

export interface GoogleVerifyResponse {
  success: boolean
  message: string
  subscription: MobileSubscription
}

/**
 * Verify a Google Play subscription
 *
 * @param purchase_token - Purchase token from Google Play Billing
 * @param product_id - Product ID (e.g., 'radly_professional_monthly')
 * @param subscription_id - Optional subscription ID (defaults to product_id)
 */
export async function verifyGooglePurchase(
  purchase_token: string,
  product_id: string,
  subscription_id?: string
): Promise<GoogleVerifyResponse> {
  const response = await httpPost<GoogleVerifyRequest, GoogleVerifyResponse>(
    '/v1/subscriptions/google/verify',
    {
      purchase_token,
      product_id,
      subscription_id,
    }
  )
  return response
}

// ============================================================================
// Subscription Status (Cross-Platform)
// ============================================================================

/**
 * Get subscription status across ALL platforms (web, iOS, Android)
 *
 * Returns the BEST subscription across all platforms and lists all active subscriptions.
 * Only requires JWT authentication.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await httpGet<SubscriptionStatus>('/v1/subscriptions/status')
  return response
}

// ============================================================================
// Restore Purchases
// ============================================================================

export interface RestoreIOSRequest {
  platform: 'ios'
  receipt_data: string
}

export interface RestoreAndroidRequest {
  platform: 'android'
  purchase_tokens: string[]
}

export type RestorePurchasesRequest = RestoreIOSRequest | RestoreAndroidRequest

export interface RestorePurchasesResponse {
  success: boolean
  restored_subscriptions: MobileSubscription[]
  count: number
}

/**
 * Restore purchases from App Store or Google Play
 *
 * Used when user reinstalls app or logs in on a new device.
 *
 * @param request - Platform-specific restore request
 */
export async function restorePurchases(
  request: RestorePurchasesRequest
): Promise<RestorePurchasesResponse> {
  const response = await httpPost<RestorePurchasesRequest, RestorePurchasesResponse>(
    '/v1/subscriptions/restore',
    request
  )
  return response
}

// ============================================================================
// Sync Subscriptions
// ============================================================================

export interface SyncSubscriptionsResponse {
  success: boolean
  synced_count: number
  errors: Array<{
    subscription_id: string
    error: string
  }> | null
}

/**
 * Re-verify all active mobile subscriptions with their respective stores
 *
 * Useful for:
 * - Refreshing subscription status after webhook delays
 * - Manually checking if subscription has expired or been canceled
 * - Syncing after restoring purchases
 */
export async function syncSubscriptions(): Promise<SyncSubscriptionsResponse> {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const response = await httpPut<{}, SyncSubscriptionsResponse>('/v1/subscriptions/sync', {})
  return response
}

// ============================================================================
// Product IDs
// ============================================================================

export const APPLE_PRODUCT_IDS = {
  starter_monthly: 'radly_starter_monthly',
  starter_yearly: 'radly_starter_yearly',
  professional_monthly: 'radly_professional_monthly',
  professional_yearly: 'radly_professional_yearly',
  premium_monthly: 'radly_premium_monthly',
  premium_yearly: 'radly_premium_yearly',
} as const

export const GOOGLE_PRODUCT_IDS = {
  starter_monthly: 'radly_starter_monthly',
  starter_yearly: 'radly_starter_yearly',
  professional_monthly: 'radly_professional_monthly',
  professional_yearly: 'radly_professional_yearly',
  premium_monthly: 'radly_premium_monthly',
  premium_yearly: 'radly_premium_yearly',
  // Alternative format
  starter_monthly_alt: 'com.radly.app.starter.monthly',
  starter_yearly_alt: 'com.radly.app.starter.yearly',
  professional_monthly_alt: 'com.radly.app.professional.monthly',
  professional_yearly_alt: 'com.radly.app.professional.yearly',
  premium_monthly_alt: 'com.radly.app.premium.monthly',
  premium_yearly_alt: 'com.radly.app.premium.yearly',
} as const

// ============================================================================
// Utilities
// ============================================================================

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: MobileSubscription): boolean {
  return (
    subscription.status === 'active' ||
    subscription.status === 'grace_period'
  )
}

/**
 * Get subscription platform label
 */
export function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'ios':
      return 'App Store'
    case 'android':
      return 'Google Play'
    case 'web':
      return 'Web'
    default:
      return 'Unknown'
  }
}

/**
 * Format expiration date
 */
export function formatExpirationDate(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
