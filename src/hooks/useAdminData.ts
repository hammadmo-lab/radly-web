"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { AdminApiClient } from '@/lib/admin-api'
import {
  SubscriptionListParams,
  ActivateSubscriptionData,
  CancelSubscriptionData
} from '@/types/admin'

export function useSubscriptions(params: SubscriptionListParams) {
  const { adminKey, apiKey } = useAdminAuth()
  
  return useQuery({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: async () => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.listSubscriptions(params)
    },
    enabled: Boolean(adminKey && apiKey),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry for 4xx errors (client errors)
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

export function useUserSubscription(userId: string) {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()
  const lastRefreshTimeRef = useRef<number>(0)

  const query = useQuery({
    queryKey: ['admin', 'subscription', 'user-id', userId],
    queryFn: async () => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.getUserSubscription(userId)
    },
    enabled: Boolean(adminKey && apiKey && userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry for 4xx errors (client errors)
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  // Force refresh function with cache busting
  const forceRefresh = useCallback(async () => {
    const now = Date.now()

    // Throttle refreshes to prevent excessive requests
    if (now - lastRefreshTimeRef.current < 2000) {
      console.log('⏱️ Admin: Refresh throttled, skipping...')
      return queryClient.getQueryData(['admin', 'subscription', 'user-id', userId])
    }

    lastRefreshTimeRef.current = now

    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'subscription', 'user-id', userId],
        exact: true,
      })

      // Force a refetch
      await queryClient.refetchQueries({
        queryKey: ['admin', 'subscription', 'user-id', userId],
        exact: true,
        type: 'active',
      })

      console.log('✅ Admin: Subscription data refreshed successfully')
      return queryClient.getQueryData(['admin', 'subscription', 'user-id', userId])
    } catch (error) {
      console.error('❌ Admin: Failed to refresh subscription data:', error)
      throw error
    }
  }, [queryClient, userId])

  // Clear all cached data for this user
  const clearCache = useCallback(() => {
    queryClient.removeQueries({
      queryKey: ['admin', 'subscription', 'user-id', userId],
    })
    console.log('🗑️ Admin: Cache cleared for user', userId)
  }, [queryClient, userId])

  return {
    ...query,
    forceRefresh,
    clearCache,
  }
}

export function useActivateSubscription() {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ActivateSubscriptionData) => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.activateSubscription(data)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', 'user-id', variables.user_email] })
      toast.success(`Successfully upgraded ${variables.user_email}`)
    },
    onError: (error: Error) => {
      // Show user-friendly error messages based on error content
      if (error.message.includes('401')) {
        toast.error('Authentication failed. Please check your admin credentials.')
      } else if (error.message.includes('403')) {
        toast.error('Access forbidden. You do not have permission to perform this action.')
      } else if (error.message.includes('404')) {
        toast.error('User not found. Please check the email address.')
      } else if (error.message.includes('503')) {
        toast.error('Service temporarily unavailable. Please try again later.')
      } else {
        toast.error(`Failed to upgrade subscription: ${error.message}`)
      }
    },
    retry: (failureCount, error) => {
      // Don't retry for 4xx errors (client errors)
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

export function useCancelSubscription() {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CancelSubscriptionData) => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.cancelSubscription(data)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', 'user-id', variables.user_email] })
      toast.success(`Successfully cancelled subscription for ${variables.user_email}`)
    },
    onError: (error: Error) => {
      // Show user-friendly error messages based on error content
      if (error.message.includes('401')) {
        toast.error('Authentication failed. Please check your admin credentials.')
      } else if (error.message.includes('403')) {
        toast.error('Access forbidden. You do not have permission to perform this action.')
      } else if (error.message.includes('404')) {
        toast.error('User not found. Please check the email address.')
      } else if (error.message.includes('503')) {
        toast.error('Service temporarily unavailable. Please try again later.')
      } else {
        toast.error(`Failed to cancel subscription: ${error.message}`)
      }
    },
    retry: (failureCount, error) => {
      // Don't retry for 4xx errors (client errors)
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

export function useUsageAnalytics(days: number = 30) {
  const { adminKey, apiKey } = useAdminAuth()
  
  return useQuery({
    queryKey: ['admin', 'analytics', 'usage', days],
    queryFn: async () => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.getUsageAnalytics(days)
    },
    enabled: Boolean(adminKey && apiKey),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch analytics on window focus
    retry: (failureCount, error) => {
      // Don't retry for 4xx errors (client errors)
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

export function useRevenueAnalytics(days: number = 30) {
  const { adminKey, apiKey } = useAdminAuth()

  return useQuery({
    queryKey: ['admin', 'analytics', 'revenue', days],
    queryFn: async () => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.getRevenueAnalytics(days)
    },
    enabled: Boolean(adminKey && apiKey),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch analytics on window focus
    retry: (failureCount, error) => {
      // Don't retry for 4xx errors (client errors)
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

export function useDeleteUser() {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.deleteUser(userId)
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', 'user-id', userId] })
      toast.success('User deleted successfully')
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        toast.error('Authentication failed. Please check your admin credentials.')
      } else if (error.message.includes('403')) {
        toast.error('Access forbidden. You do not have permission to delete users.')
      } else if (error.message.includes('404')) {
        toast.error('User not found.')
      } else {
        toast.error(`Failed to delete user: ${error.message}`)
      }
    },
    retry: false, // Don't retry delete operations
  })
}

export function useChangeTier() {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, tierName, region }: { userId: string; tierName: string; region?: string }) => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.changeTier(userId, tierName, region)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', 'user-id', variables.userId] })
      toast.success(`Tier changed to ${variables.tierName} successfully`)
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        toast.error('Authentication failed. Please check your admin credentials.')
      } else if (error.message.includes('403')) {
        toast.error('Access forbidden. You do not have permission to change tiers.')
      } else if (error.message.includes('404')) {
        toast.error('User not found.')
      } else {
        toast.error(`Failed to change tier: ${error.message}`)
      }
    },
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      return failureCount < 2
    },
  })
}
