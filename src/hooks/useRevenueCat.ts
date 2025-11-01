/**
 * RevenueCat React Hooks
 *
 * Custom hooks for managing in-app purchases and subscriptions
 * using RevenueCat in React components.
 */

'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  initializeRevenueCat,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCurrentTier,
  hasActiveEntitlement,
  identifyUser,
  logoutUser,
} from '@/lib/revenuecat'
import { usePlatform } from './usePlatform'

/**
 * Initialize RevenueCat on app start
 *
 * Call this hook once in your root layout/app component
 *
 * @param userId - Optional user ID to identify subscriber
 * @returns Initialization status
 */
export function useRevenueCatInit(userId?: string) {
  const { isNative } = usePlatform()
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Only initialize on native platforms
    if (!isNative) {
      return
    }

    let mounted = true

    const initialize = async () => {
      try {
        await initializeRevenueCat(userId)
        if (mounted) {
          setIsInitialized(true)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error)
          console.error('[useRevenueCatInit] Failed:', err)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [isNative, userId])

  return { isInitialized, error }
}

/**
 * Get customer info (subscription status)
 *
 * @returns Query result with customer info
 */
export function useCustomerInfo() {
  const { isNative } = usePlatform()

  return useQuery({
    queryKey: ['revenuecat', 'customerInfo'],
    queryFn: getCustomerInfo,
    enabled: isNative,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

/**
 * Get available offerings/packages
 *
 * @returns Query result with offerings
 */
export function useOfferings() {
  const { isNative } = usePlatform()

  return useQuery({
    queryKey: ['revenuecat', 'offerings'],
    queryFn: getOfferings,
    enabled: isNative,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Get current subscription tier
 *
 * @returns Query result with tier name
 */
export function useCurrentTier() {
  const { isNative } = usePlatform()

  return useQuery({
    queryKey: ['revenuecat', 'currentTier'],
    queryFn: getCurrentTier,
    enabled: isNative,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

/**
 * Check if user has specific entitlement
 *
 * @param entitlementId - Entitlement identifier to check
 * @returns Query result with boolean
 */
export function useHasEntitlement(entitlementId: string) {
  const { isNative } = usePlatform()

  return useQuery({
    queryKey: ['revenuecat', 'entitlement', entitlementId],
    queryFn: () => hasActiveEntitlement(entitlementId),
    enabled: isNative && !!entitlementId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

/**
 * Purchase a package
 *
 * @returns Mutation for purchasing
 */
export function usePurchasePackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (packageToPurchase: unknown) => purchasePackage(packageToPurchase),
    onSuccess: (customerInfo) => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['revenuecat'] })
      console.log('[usePurchasePackage] Purchase successful:', customerInfo)
    },
    onError: (error: Error) => {
      if (error?.message === 'PURCHASE_CANCELLED') {
        console.log('[usePurchasePackage] User cancelled')
      } else {
        console.error('[usePurchasePackage] Purchase failed:', error)
      }
    },
  })
}

/**
 * Restore purchases
 *
 * @returns Mutation for restoring
 */
export function useRestorePurchases() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: restorePurchases,
    onSuccess: (customerInfo) => {
      queryClient.invalidateQueries({ queryKey: ['revenuecat'] })
      console.log('[useRestorePurchases] Restored:', customerInfo)
    },
    onError: (error) => {
      console.error('[useRestorePurchases] Failed:', error)
    },
  })
}

/**
 * Identify user with RevenueCat
 *
 * @returns Mutation for identifying user
 */
export function useIdentifyUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => identifyUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenuecat'] })
      console.log('[useIdentifyUser] User identified')
    },
    onError: (error) => {
      console.error('[useIdentifyUser] Failed:', error)
    },
  })
}

/**
 * Logout user from RevenueCat
 *
 * @returns Mutation for logging out
 */
export function useLogoutUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenuecat'] })
      console.log('[useLogoutUser] User logged out')
    },
    onError: (error) => {
      console.error('[useLogoutUser] Failed:', error)
    },
  })
}

/**
 * Complete RevenueCat state management hook
 *
 * Provides all RevenueCat functionality in a single hook
 *
 * @returns Object with all RevenueCat operations and state
 */
export function useRevenueCat() {
  const { isNative, platform } = usePlatform()
  const customerInfo = useCustomerInfo()
  const offerings = useOfferings()
  const currentTier = useCurrentTier()
  const purchase = usePurchasePackage()
  const restore = useRestorePurchases()
  const identify = useIdentifyUser()
  const logout = useLogoutUser()

  return {
    // Platform info
    isNative,
    platform,

    // Data queries
    customerInfo: customerInfo.data,
    isLoadingCustomerInfo: customerInfo.isLoading,
    customerInfoError: customerInfo.error,

    offerings: offerings.data,
    isLoadingOfferings: offerings.isLoading,
    offeringsError: offerings.error,

    currentTier: currentTier.data,
    isLoadingTier: currentTier.isLoading,

    // Mutations
    purchasePackage: purchase.mutate,
    isPurchasing: purchase.isPending,
    purchaseError: purchase.error,

    restorePurchases: restore.mutate,
    isRestoring: restore.isPending,
    restoreError: restore.error,

    identifyUser: identify.mutate,
    logoutUser: logout.mutate,

    // Refetch functions
    refetchCustomerInfo: customerInfo.refetch,
    refetchOfferings: offerings.refetch,
  }
}
