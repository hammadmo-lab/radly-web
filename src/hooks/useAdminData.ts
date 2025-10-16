"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  })
}

export function useUserSubscription(email: string) {
  const { adminKey, apiKey } = useAdminAuth()
  
  return useQuery({
    queryKey: ['admin', 'subscription', email],
    queryFn: async () => {
      if (!adminKey || !apiKey) throw new Error('Admin credentials not available')
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.getUserSubscription(email)
    },
    enabled: Boolean(adminKey && apiKey && email),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', variables.user_email] })
      toast.success(`Successfully upgraded ${variables.user_email}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to upgrade subscription: ${error.message}`)
    },
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', variables.user_email] })
      toast.success(`Successfully cancelled subscription for ${variables.user_email}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`)
    },
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
  })
}
