/**
 * React Query hooks for push notifications
 *
 * Provides hooks for:
 * - Registering FCM tokens
 * - Unregistering FCM tokens
 * - Fetching registered tokens
 * - Sending test notifications
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  registerFCMToken,
  unregisterFCMToken,
  getRegisteredTokens,
  sendTestNotification,
  type NotificationPlatform,
  type RegisterTokenResponse,
  type UnregisterTokenResponse,
  type TokensResponse,
  type TestNotificationResponse,
} from '@/lib/notifications'

// ============================================================================
// Register FCM Token
// ============================================================================

interface UseRegisterFCMTokenParams {
  onSuccess?: (data: RegisterTokenResponse) => void
  onError?: (error: Error) => void
}

/**
 * Register an FCM token to receive push notifications
 *
 * @example
 * ```tsx
 * const { mutate: registerToken, isPending } = useRegisterFCMToken({
 *   onSuccess: () => {
 *     console.log('Token registered successfully')
 *   }
 * })
 *
 * // After getting FCM token from Firebase SDK
 * registerToken({
 *   fcm_token: 'token_from_firebase',
 *   platform: 'ios',
 *   device_name: 'iPhone 14 Pro'
 * })
 * ```
 */
export function useRegisterFCMToken(params?: UseRegisterFCMTokenParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      fcm_token,
      platform,
      device_name,
    }: {
      fcm_token: string
      platform: NotificationPlatform
      device_name?: string
    }) => registerFCMToken(fcm_token, platform, device_name),
    onSuccess: (data) => {
      // Invalidate tokens query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['notification-tokens'] })
      params?.onSuccess?.(data)
    },
    onError: params?.onError,
  })
}

// ============================================================================
// Unregister FCM Token
// ============================================================================

interface UseUnregisterFCMTokenParams {
  onSuccess?: (data: UnregisterTokenResponse) => void
  onError?: (error: Error) => void
}

/**
 * Unregister an FCM token to stop receiving push notifications
 *
 * @example
 * ```tsx
 * const { mutate: unregisterToken, isPending } = useUnregisterFCMToken({
 *   onSuccess: () => {
 *     console.log('Token unregistered successfully')
 *   }
 * })
 *
 * unregisterToken({ fcm_token: 'token_to_remove' })
 * ```
 */
export function useUnregisterFCMToken(params?: UseUnregisterFCMTokenParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fcm_token }: { fcm_token: string }) =>
      unregisterFCMToken(fcm_token),
    onSuccess: (data) => {
      // Invalidate tokens query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['notification-tokens'] })
      params?.onSuccess?.(data)
    },
    onError: params?.onError,
  })
}

// ============================================================================
// Get Registered Tokens
// ============================================================================

interface UseNotificationTokensParams {
  enabled?: boolean
}

/**
 * Fetch all registered FCM tokens for the current user
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useNotificationTokens()
 *
 * if (data) {
 *   console.log(`You have ${data.count} registered devices`)
 * }
 * ```
 */
export function useNotificationTokens(params?: UseNotificationTokensParams) {
  return useQuery({
    queryKey: ['notification-tokens'],
    queryFn: () => getRegisteredTokens(),
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status
        if (status === 401 || status === 403) {
          return false
        }
      }
      return failureCount < 3
    },
  })
}

// ============================================================================
// Send Test Notification
// ============================================================================

interface UseSendTestNotificationParams {
  onSuccess?: (data: TestNotificationResponse) => void
  onError?: (error: Error) => void
}

/**
 * Send a test push notification
 *
 * @example
 * ```tsx
 * const { mutate: sendTest, isPending } = useSendTestNotification({
 *   onSuccess: (data) => {
 *     if (data.success) {
 *       console.log('Test notification sent!')
 *     }
 *   }
 * })
 *
 * // Send to first registered token
 * sendTest()
 *
 * // Send to specific token
 * sendTest({ fcm_token: 'specific_token' })
 * ```
 */
export function useSendTestNotification(params?: UseSendTestNotificationParams) {
  return useMutation({
    mutationFn: ({ fcm_token }: { fcm_token?: string } = {}) =>
      sendTestNotification(fcm_token),
    onSuccess: params?.onSuccess,
    onError: params?.onError,
  })
}

// ============================================================================
// Combined Hook for Notification Management
// ============================================================================

/**
 * Comprehensive hook for notification management
 *
 * Provides all notification-related operations in a single hook
 *
 * @example
 * ```tsx
 * const {
 *   tokens,
 *   isLoadingTokens,
 *   registerToken,
 *   unregisterToken,
 *   sendTest,
 *   isRegistering,
 *   isUnregistering,
 *   isSendingTest
 * } = useNotifications({
 *   onRegisterSuccess: () => toast.success('Notifications enabled'),
 *   onUnregisterSuccess: () => toast.success('Notifications disabled')
 * })
 * ```
 */
export function useNotifications(params?: {
  enabled?: boolean
  onRegisterSuccess?: (data: RegisterTokenResponse) => void
  onRegisterError?: (error: Error) => void
  onUnregisterSuccess?: (data: UnregisterTokenResponse) => void
  onUnregisterError?: (error: Error) => void
  onTestSuccess?: (data: TestNotificationResponse) => void
  onTestError?: (error: Error) => void
}) {
  const tokensQuery = useNotificationTokens({ enabled: params?.enabled })

  const registerMutation = useRegisterFCMToken({
    onSuccess: params?.onRegisterSuccess,
    onError: params?.onRegisterError,
  })

  const unregisterMutation = useUnregisterFCMToken({
    onSuccess: params?.onUnregisterSuccess,
    onError: params?.onUnregisterError,
  })

  const testMutation = useSendTestNotification({
    onSuccess: params?.onTestSuccess,
    onError: params?.onTestError,
  })

  return {
    // Token data
    tokens: tokensQuery.data?.tokens || [],
    tokenCount: tokensQuery.data?.count || 0,
    isLoadingTokens: tokensQuery.isLoading,
    tokensError: tokensQuery.error,

    // Register token
    registerToken: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    // Unregister token
    unregisterToken: unregisterMutation.mutate,
    isUnregistering: unregisterMutation.isPending,
    unregisterError: unregisterMutation.error,

    // Test notification
    sendTest: testMutation.mutate,
    isSendingTest: testMutation.isPending,
    testError: testMutation.error,

    // Utility
    refetchTokens: tokensQuery.refetch,
  }
}
