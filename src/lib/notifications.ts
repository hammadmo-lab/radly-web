/**
 * Push Notifications API Client
 *
 * Handles API calls for Firebase Cloud Messaging (FCM) push notification management.
 * Integrates with backend endpoints documented in API_NOTIFICATIONS.md
 */

import { httpGet, httpPost, httpDelete } from './http'

// ============================================================================
// Types
// ============================================================================

export type NotificationPlatform = 'ios' | 'android'

export interface FCMToken {
  fcm_token: string
  platform: NotificationPlatform
  device_name?: string
}

export interface RegisterTokenResponse {
  success: boolean
  message: string
}

export interface UnregisterTokenResponse {
  success: boolean
  message: string
}

export interface TokensResponse {
  success: boolean
  tokens: string[]
  count: number
}

export interface TestNotificationResponse {
  success: boolean
  message: string
}

// ============================================================================
// Register FCM Token
// ============================================================================

/**
 * Register a Firebase Cloud Messaging token to receive push notifications
 *
 * @param fcm_token - FCM device token from Firebase SDK
 * @param platform - Device platform ('ios' or 'android')
 * @param device_name - Optional device name (e.g., "iPhone 14 Pro")
 */
export async function registerFCMToken(
  fcm_token: string,
  platform: NotificationPlatform,
  device_name?: string
): Promise<RegisterTokenResponse> {
  const response = await httpPost<{ fcm_token: string; platform: NotificationPlatform; device_name?: string }, RegisterTokenResponse>(
    '/v1/notifications/register',
    {
      fcm_token,
      platform,
      device_name,
    }
  )
  return response
}

// ============================================================================
// Unregister FCM Token
// ============================================================================

/**
 * Remove an FCM token to stop receiving push notifications
 *
 * @param fcm_token - FCM device token to remove
 */
export async function unregisterFCMToken(
  fcm_token: string
): Promise<UnregisterTokenResponse> {
  const response = await httpDelete<{ fcm_token: string }, UnregisterTokenResponse>(
    '/v1/notifications/unregister',
    { fcm_token }
  )
  return response
}

// ============================================================================
// Get Registered Tokens
// ============================================================================

/**
 * Retrieve all FCM tokens registered for the authenticated user
 */
export async function getRegisteredTokens(): Promise<TokensResponse> {
  const response = await httpGet<TokensResponse>('/v1/notifications/tokens')
  return response
}

// ============================================================================
// Send Test Notification
// ============================================================================

/**
 * Send a test push notification to the authenticated user's devices
 *
 * @param fcm_token - Optional specific token to test (sends to first token if omitted)
 */
export async function sendTestNotification(
  fcm_token?: string
): Promise<TestNotificationResponse> {
  const response = await httpPost<{ fcm_token?: string }, TestNotificationResponse>(
    '/v1/notifications/test',
    fcm_token ? { fcm_token } : {}
  )
  return response
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | 'report_complete'
  | 'report_failed'
  | 'usage_warning'
  | 'subscription_expiring'
  | 'renewal_failed'
  | 'test'

export interface NotificationPayload {
  title: string
  body: string
  data: {
    type: NotificationType
    action?: string
    report_id?: string
    reports_used?: string
    reports_limit?: string
    tier?: string
    days_remaining?: string
    timestamp?: string
    [key: string]: string | undefined
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Check if FCM is supported in the current environment
 *
 * FCM is only available in native mobile apps with Firebase SDK
 */
export function isFCMSupported(): boolean {
  // This will be updated when Capacitor is integrated
  // For now, check if running in a native context
  if (typeof window === 'undefined') return false

  // Check for Capacitor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any).Capacitor !== 'undefined'
}

/**
 * Get platform from user agent (for device detection)
 */
export function detectNotificationPlatform(): NotificationPlatform | null {
  if (typeof window === 'undefined') return null

  const userAgent = window.navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios'
  }

  if (/android/.test(userAgent)) {
    return 'android'
  }

  return null
}

/**
 * Get device name for notification registration
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device'

  const userAgent = window.navigator.userAgent

  // iOS devices
  if (/iPhone/.test(userAgent)) {
    return 'iPhone'
  }
  if (/iPad/.test(userAgent)) {
    return 'iPad'
  }
  if (/iPod/.test(userAgent)) {
    return 'iPod'
  }

  // Android devices
  if (/Android/.test(userAgent)) {
    // Try to extract device model from user agent
    const match = userAgent.match(/Android.*;\s([^)]+)\)/)
    if (match && match[1]) {
      return match[1]
    }
    return 'Android Device'
  }

  return 'Unknown Device'
}

/**
 * Format notification action for deep linking
 *
 * @param action - Action type from notification data
 * @param reportId - Optional report ID for navigation
 * @returns Navigation path
 */
export function getNotificationActionPath(
  action?: string,
  reportId?: string
): string {
  switch (action) {
    case 'view_report':
      return reportId ? `/app/reports?id=${reportId}` : '/app/reports'
    case 'view_error':
      return '/app/reports'
    case 'renew_subscription':
    case 'update_payment':
      return '/app/settings'
    default:
      return '/app/dashboard'
  }
}
