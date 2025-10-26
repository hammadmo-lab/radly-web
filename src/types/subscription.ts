/**
 * Subscription types for cross-platform subscription management.
 *
 * Supports web (Stripe/manual), iOS (App Store), and Android (Google Play) subscriptions.
 */

import type { Platform, AppStore } from '@/lib/platform'

/**
 * Subscription tier names
 */
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'premium'

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'grace_period'
  | 'on_hold'
  | 'paused'

/**
 * Payment provider types
 */
export type PaymentProvider = 'stripe' | 'apple' | 'google' | 'manual' | 'test'

/**
 * Cross-platform subscription data returned from /v1/subscriptions/status
 */
export interface SubscriptionData {
  /** User's subscription ID */
  subscription_id: string
  /** User ID */
  user_id: string
  /** Current tier name */
  tier_name: SubscriptionTier
  /** Display name for tier */
  tier_display_name: string
  /** Platform where subscription was purchased */
  platform: Platform
  /** App store where subscription is managed */
  store: AppStore
  /** Payment provider */
  payment_provider: PaymentProvider
  /** Region (egypt, international) */
  region: string
  /** Price paid in local currency */
  price_paid: number
  /** Currency code (USD, EGP, etc.) */
  currency: string
  /** Reports used in current period */
  reports_used_current_period: number
  /** Reports limit for current tier */
  reports_limit: number
  /** Period start date (ISO 8601) */
  period_start: string
  /** Period end date (ISO 8601) */
  period_end: string
  /** Subscription status */
  status: SubscriptionStatus
  /** Whether auto-renew is enabled */
  auto_renew: boolean
  /** Created timestamp (ISO 8601) */
  created_at: string
  /** Last updated timestamp (ISO 8601) */
  updated_at: string
  /** Cancellation timestamp (ISO 8601), if cancelled */
  cancelled_at?: string
  /** Store transaction ID (for Apple/Google) */
  store_transaction_id?: string
  /** Original transaction ID (for Apple) */
  original_transaction_id?: string
}

/**
 * Apple receipt verification request
 */
export interface AppleReceiptVerifyRequest {
  /** Base64-encoded receipt data from iOS */
  receipt_data: string
  /** Product ID that was purchased */
  product_id: string
}

/**
 * Apple receipt verification response
 */
export interface AppleReceiptVerifyResponse {
  /** Whether verification succeeded */
  success: boolean
  /** Subscription data if successful */
  subscription?: SubscriptionData
  /** Error message if failed */
  error?: string
}

/**
 * Google Play purchase verification request
 */
export interface GooglePurchaseVerifyRequest {
  /** Purchase token from Android */
  purchase_token: string
  /** Product ID that was purchased */
  product_id: string
}

/**
 * Google Play purchase verification response
 */
export interface GooglePurchaseVerifyResponse {
  /** Whether verification succeeded */
  success: boolean
  /** Subscription data if successful */
  subscription?: SubscriptionData
  /** Error message if failed */
  error?: string
}

/**
 * Restore purchases request
 */
export interface RestorePurchasesRequest {
  /** Platform to restore for */
  platform: 'ios' | 'android'
  /** Receipt data (iOS) or purchase token (Android) */
  receipt_data?: string
}

/**
 * Restore purchases response
 */
export interface RestorePurchasesResponse {
  /** Whether restore succeeded */
  success: boolean
  /** Number of purchases restored */
  restored_count: number
  /** Active subscription after restore */
  subscription?: SubscriptionData
  /** Error message if failed */
  error?: string
}

/**
 * Sync subscription request
 */
export interface SyncSubscriptionRequest {
  /** Platform to sync */
  platform: Platform
}

/**
 * Sync subscription response
 */
export interface SyncSubscriptionResponse {
  /** Whether sync succeeded */
  success: boolean
  /** Updated subscription data */
  subscription?: SubscriptionData
  /** Error message if failed */
  error?: string
}

/**
 * FCM token registration request
 */
export interface RegisterFCMTokenRequest {
  /** Firebase Cloud Messaging token */
  fcm_token: string
  /** Platform: ios or android */
  platform: 'ios' | 'android'
  /** Optional device name for identification */
  device_name?: string
}

/**
 * FCM token registration response
 */
export interface RegisterFCMTokenResponse {
  /** Whether registration succeeded */
  success: boolean
  /** Token ID if successful */
  token_id?: string
  /** Error message if failed */
  error?: string
}

/**
 * FCM token data
 */
export interface FCMToken {
  /** Token ID */
  token_id: string
  /** User ID */
  user_id: string
  /** FCM token string */
  fcm_token: string
  /** Platform */
  platform: 'ios' | 'android'
  /** Device name */
  device_name?: string
  /** Registration timestamp */
  registered_at: string
  /** Last used timestamp */
  last_used_at?: string
}

/**
 * List FCM tokens response
 */
export interface ListFCMTokensResponse {
  /** List of registered tokens */
  tokens: FCMToken[]
}

/**
 * Unregister FCM token request
 */
export interface UnregisterFCMTokenRequest {
  /** FCM token to unregister */
  fcm_token: string
}

/**
 * Unregister FCM token response
 */
export interface UnregisterFCMTokenResponse {
  /** Whether unregistration succeeded */
  success: boolean
  /** Error message if failed */
  error?: string
}

/**
 * Push notification types
 */
export type NotificationType =
  | 'report_complete'
  | 'report_failed'
  | 'usage_warning'
  | 'subscription_expiring'
  | 'subscription_renewed'
  | 'subscription_renewal_failed'

/**
 * Push notification payload data
 */
export interface NotificationData {
  /** Notification type */
  type: NotificationType
  /** Optional report ID */
  report_id?: string
  /** Optional template name */
  template_name?: string
  /** Optional action to take */
  action?: 'view_report' | 'view_error' | 'renew_subscription' | 'update_payment'
  /** Additional custom data */
  [key: string]: string | undefined
}

/**
 * Subscription tier information (for display)
 */
export interface TierInfo {
  /** Tier name */
  tier: SubscriptionTier
  /** Display name */
  display_name: string
  /** Reports per month */
  reports_limit: number
  /** Price in USD (international) */
  price_usd: number
  /** Price in EGP (Egypt) */
  price_egp: number
  /** Features list */
  features: string[]
}

/**
 * Usage analytics data
 */
export interface UsageData {
  /** Reports used in current period */
  reports_used: number
  /** Reports limit for current tier */
  reports_limit: number
  /** Usage percentage (0-100) */
  usage_percentage: number
  /** Days remaining in period */
  days_remaining: number
  /** Whether user is approaching limit (>80%) */
  is_approaching_limit: boolean
  /** Whether user has exceeded limit */
  is_over_limit: boolean
}

/**
 * Helper type for subscription loading states
 */
export interface SubscriptionState {
  /** Subscription data */
  data: SubscriptionData | null
  /** Whether data is loading */
  isLoading: boolean
  /** Error if loading failed */
  error: Error | null
  /** Whether data is ready */
  isReady: boolean
}
