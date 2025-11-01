/**
 * React Query hooks for mobile subscriptions
 *
 * Provides hooks for:
 * - Verifying Apple App Store receipts
 * - Verifying Google Play purchases
 * - Restoring purchases
 * - Syncing subscriptions with stores
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  verifyAppleReceipt,
  verifyGooglePurchase,
  restorePurchases,
  syncSubscriptions,
  type AppleVerifyResponse,
  type GoogleVerifyResponse,
  type RestorePurchasesRequest,
  type RestorePurchasesResponse,
  type SyncSubscriptionsResponse,
} from '@/lib/mobile-subscriptions'

// ============================================================================
// Apple App Store
// ============================================================================

interface UseVerifyAppleReceiptParams {
  onSuccess?: (data: AppleVerifyResponse) => void
  onError?: (error: Error) => void
}

/**
 * Verify an Apple App Store receipt
 *
 * @example
 * ```tsx
 * const { mutate: verifyReceipt, isPending } = useVerifyAppleReceipt({
 *   onSuccess: (data) => {
 *     console.log('Receipt verified:', data.subscription)
 *   },
 *   onError: (error) => {
 *     console.error('Verification failed:', error)
 *   }
 * })
 *
 * // After purchase
 * verifyReceipt({
 *   receipt_data: 'base64_receipt...',
 *   product_id: 'radly_professional_monthly'
 * })
 * ```
 */
export function useVerifyAppleReceipt(params?: UseVerifyAppleReceiptParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      receipt_data,
      product_id,
      transaction_id,
    }: {
      receipt_data: string
      product_id: string
      transaction_id?: string
    }) => verifyAppleReceipt(receipt_data, product_id, transaction_id),
    onSuccess: (data) => {
      // Invalidate subscription queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      params?.onSuccess?.(data)
    },
    onError: params?.onError,
  })
}

// ============================================================================
// Google Play Store
// ============================================================================

interface UseVerifyGooglePurchaseParams {
  onSuccess?: (data: GoogleVerifyResponse) => void
  onError?: (error: Error) => void
}

/**
 * Verify a Google Play subscription
 *
 * @example
 * ```tsx
 * const { mutate: verifyPurchase, isPending } = useVerifyGooglePurchase({
 *   onSuccess: (data) => {
 *     console.log('Purchase verified:', data.subscription)
 *   },
 *   onError: (error) => {
 *     console.error('Verification failed:', error)
 *   }
 * })
 *
 * // After purchase
 * verifyPurchase({
 *   purchase_token: 'token...',
 *   product_id: 'radly_professional_monthly'
 * })
 * ```
 */
export function useVerifyGooglePurchase(params?: UseVerifyGooglePurchaseParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      purchase_token,
      product_id,
      subscription_id,
    }: {
      purchase_token: string
      product_id: string
      subscription_id?: string
    }) => verifyGooglePurchase(purchase_token, product_id, subscription_id),
    onSuccess: (data) => {
      // Invalidate subscription queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      params?.onSuccess?.(data)
    },
    onError: params?.onError,
  })
}

// ============================================================================
// Restore Purchases
// ============================================================================

interface UseRestorePurchasesParams {
  onSuccess?: (data: RestorePurchasesResponse) => void
  onError?: (error: Error) => void
}

/**
 * Restore purchases from App Store or Google Play
 *
 * Used when user reinstalls app or logs in on a new device.
 *
 * @example
 * ```tsx
 * const { mutate: restore, isPending } = useRestorePurchases({
 *   onSuccess: (data) => {
 *     console.log(`Restored ${data.count} subscriptions`)
 *   }
 * })
 *
 * // iOS
 * restore({
 *   platform: 'ios',
 *   receipt_data: 'base64_receipt...'
 * })
 *
 * // Android
 * restore({
 *   platform: 'android',
 *   purchase_tokens: ['token1', 'token2']
 * })
 * ```
 */
export function useRestorePurchases(params?: UseRestorePurchasesParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: RestorePurchasesRequest) => restorePurchases(request),
    onSuccess: (data) => {
      // Invalidate subscription queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      params?.onSuccess?.(data)
    },
    onError: params?.onError,
  })
}

// ============================================================================
// Sync Subscriptions
// ============================================================================

interface UseSyncSubscriptionsParams {
  onSuccess?: (data: SyncSubscriptionsResponse) => void
  onError?: (error: Error) => void
}

/**
 * Re-verify all active mobile subscriptions with their respective stores
 *
 * Useful for:
 * - Refreshing subscription status after webhook delays
 * - Manually checking if subscription has expired or been canceled
 * - Syncing after restoring purchases
 *
 * @example
 * ```tsx
 * const { mutate: sync, isPending } = useSyncSubscriptions({
 *   onSuccess: (data) => {
 *     console.log(`Synced ${data.synced_count} subscriptions`)
 *     if (data.errors) {
 *       console.error('Some subscriptions failed to sync:', data.errors)
 *     }
 *   }
 * })
 *
 * // Trigger sync
 * sync()
 * ```
 */
export function useSyncSubscriptions(params?: UseSyncSubscriptionsParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => syncSubscriptions(),
    onSuccess: (data) => {
      // Invalidate subscription queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      params?.onSuccess?.(data)
    },
    onError: params?.onError,
  })
}
