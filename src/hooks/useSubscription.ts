"use client"

import { useQuery } from '@tanstack/react-query'
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

interface UsageData {
  subscription: SubscriptionData
  usage_stats: {
    total_reports: number
    avg_generation_time: number
  }
}

/**
 * Hook to fetch and cache user subscription data
 *
 * Uses React Query to fetch from /v1/subscription/usage endpoint
 * Automatically refetches every 60 seconds when user is authenticated
 *
 * @returns {Object} Query result with subscription data and loading/error states
 */
export function useSubscription() {
  const { isAuthed, mounted } = useAuthSession()

  return useQuery({
    queryKey: ['subscription-usage'],
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
