"use client"

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { httpGet } from '@/lib/http'
import { useAuthSession } from '@/hooks/useAuthSession'

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'premium'

export interface SubscriptionData {
  tier: SubscriptionTier
  tier_display_name: string
  reports_used: number
  reports_limit: number
  reports_remaining: number
  period_end: string
  price_monthly: number
  currency: string
  status: string
}

interface UsageStats {
  total_reports?: number
  avg_generation_time?: number | string | null
  avg_generation_time_seconds?: number | string | null
  average_generation_time_seconds?: number | string | null
  average_generation_time?: number | string | null
  [key: string]: unknown
}

interface UsageData {
  subscription: SubscriptionData
  usage_stats?: UsageStats | null
}

const CACHE_KEYS = {
  subscription: ['subscription-usage'] as const,
  localStorage: {
    lastKnownTier: 'radly_last_known_tier',
    lastKnownStatus: 'radly_last_known_status',
  },
}

interface TierChangeInfo {
  previousTier: string | null
  currentTier: string | null
  status: string
  timestamp: number
}

/**
 * Hook to fetch and cache user subscription data with force refresh and tier change detection
 *
 * Uses React Query to fetch from /v1/subscription/usage endpoint
 * Automatically refetches every 60 seconds when user is authenticated
 *
 * @returns {Object} Query result with subscription data, loading/error states, and control methods
 */
export function useSubscription() {
  const { isAuthed, mounted } = useAuthSession()
  const queryClient = useQueryClient()
  const previousTierRef = useRef<string | null>(null)
  const lastRefreshTimeRef = useRef<number>(0)

  const query = useQuery({
    queryKey: CACHE_KEYS.subscription,
    queryFn: () => httpGet<UsageData>('/v1/subscription/usage'),
    refetchInterval: 60000, // Refetch every minute
    enabled: mounted && isAuthed, // Only fetch when authenticated
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status
        if (status === 401 || status === 403 || status === 404) {
          return false
        }
      }
      return failureCount < 3
    },
    staleTime: 30000, // Consider data stale after 30 seconds
  })

  // Detect tier changes when data updates
  useEffect(() => {
    if (query.data?.subscription) {
      const currentTier = query.data.subscription.tier
      const currentStatus = query.data.subscription.status

      // Load previous tier from ref or localStorage
      const lastKnownTier = previousTierRef.current ||
        localStorage.getItem(CACHE_KEYS.localStorage.lastKnownTier)

      // Detect tier change
      if (lastKnownTier && lastKnownTier !== currentTier) {
        console.log('🔄 Tier change detected:', {
          from: lastKnownTier,
          to: currentTier,
          status: currentStatus,
        })

        // Store tier change info
        const tierChangeInfo: TierChangeInfo = {
          previousTier: lastKnownTier,
          currentTier,
          status: currentStatus,
          timestamp: Date.now(),
        }
        localStorage.setItem(
          CACHE_KEYS.localStorage.lastKnownTier,
          currentTier
        )

        // Dispatch custom event for tier change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('subscription:tier-change', {
              detail: tierChangeInfo,
            })
          )
        }
      }

      // Always update the last known tier
      previousTierRef.current = currentTier
      localStorage.setItem(CACHE_KEYS.localStorage.lastKnownTier, currentTier)
      localStorage.setItem(CACHE_KEYS.localStorage.lastKnownStatus, currentStatus)
    }
  }, [query.data?.subscription])

  // Force refresh function with cache busting
  const forceRefresh = useCallback(async () => {
    const now = Date.now()

    // Throttle refreshes to prevent excessive requests
    if (now - lastRefreshTimeRef.current < 2000) {
      console.log('⏱️ Refresh throttled, skipping...')
      return queryClient.getQueryData<UsageData>(CACHE_KEYS.subscription)
    }

    lastRefreshTimeRef.current = now

    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: CACHE_KEYS.subscription,
        exact: true,
      })

      // Force a refetch
      await queryClient.refetchQueries({
        queryKey: CACHE_KEYS.subscription,
        exact: true,
        type: 'active',
      })

      console.log('✅ Subscription data refreshed successfully')
      return queryClient.getQueryData<UsageData>(CACHE_KEYS.subscription)
    } catch (error) {
      console.error('❌ Failed to refresh subscription data:', error)
      throw error
    }
  }, [queryClient])

  // Clear all cached subscription data
  const clearCache = useCallback(() => {
    queryClient.removeQueries({
      queryKey: CACHE_KEYS.subscription,
    })

    // Also clear localStorage cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEYS.localStorage.lastKnownTier)
      localStorage.removeItem(CACHE_KEYS.localStorage.lastKnownStatus)
    }

    console.log('🗑️ Subscription cache cleared')
  }, [queryClient])

  return {
    ...query,
    forceRefresh,
    clearCache,
  }
}

/**
 * Hook to get just the subscription tier (for tier gating)
 *
 * Returns 'free' as default if data is not yet loaded or on error
 *
 * @returns {SubscriptionTier} The user's current subscription tier
 */
export function useSubscriptionTier(): SubscriptionTier {
  const { data } = useSubscription()
  return (data?.subscription.tier as SubscriptionTier) || 'free'
}

/**
 * Hook to check if user has access to specific tiers
 *
 * @param requiredTiers - Array of tiers that have access to the feature
 * @returns {boolean} Whether the user has access
 */
export function useHasTierAccess(requiredTiers: SubscriptionTier[]): boolean {
  const currentTier = useSubscriptionTier()
  return requiredTiers.includes(currentTier)
}
