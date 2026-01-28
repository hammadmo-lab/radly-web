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
import {
  ApiKeyListParams,
  CreateApiKeyRequest,
  UpdateApiKeyRequest
} from '@/types/api-keys'

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

// ==================== API Keys Hooks ====================

export function useApiKeys(params?: ApiKeyListParams) {
  const { adminKey, apiKey } = useAdminAuth()

  return useQuery({
    queryKey: ['admin', 'api-keys', params],
    queryFn: async () => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.listApiKeys(params)
    },
    enabled: Boolean(adminKey && apiKey),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useApiKey(id: number) {
  const { adminKey, apiKey } = useAdminAuth()

  return useQuery({
    queryKey: ['admin', 'api-keys', id],
    queryFn: async () => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.getApiKey(id)
    },
    enabled: Boolean(adminKey && apiKey && id),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useCreateApiKey() {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateApiKeyRequest) => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.createApiKey(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
      toast.success('API key created successfully')
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        toast.error('Authentication failed. Please check your admin credentials.')
      } else if (error.message.includes('403')) {
        toast.error('Access forbidden. You do not have permission to create API keys.')
      } else if (error.message.includes('404')) {
        toast.error('User not found. Please check the user ID.')
      } else {
        toast.error(`Failed to create API key: ${error.message}`)
      }
    },
    retry: false,
  })
}

export function useUpdateApiKey() {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateApiKeyRequest }) => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.updateApiKey(id, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys', variables.id] })
      toast.success('API key updated successfully')
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        toast.error('Authentication failed. Please check your admin credentials.')
      } else if (error.message.includes('403')) {
        toast.error('Access forbidden. You do not have permission to update API keys.')
      } else if (error.message.includes('404')) {
        toast.error('API key not found.')
      } else {
        toast.error(`Failed to update API key: ${error.message}`)
      }
    },
    retry: false,
  })
}

export function useDeleteApiKey() {
  const { adminKey, apiKey } = useAdminAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.deleteApiKey(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
      toast.success('API key revoked successfully')
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        toast.error('Authentication failed. Please check your admin credentials.')
      } else if (error.message.includes('403')) {
        toast.error('Access forbidden. You do not have permission to delete API keys.')
      } else if (error.message.includes('404')) {
        toast.error('API key not found.')
      } else {
        toast.error(`Failed to revoke API key: ${error.message}`)
      }
    },
    retry: false,
  })
}
