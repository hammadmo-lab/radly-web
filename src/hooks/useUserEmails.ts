import { useQuery } from '@tanstack/react-query'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { AdminApiClient } from '@/lib/admin-api'

export function useUserEmails(userIds: string[]) {
  const { adminKey, apiKey } = useAdminAuth()
  
  return useQuery({
    queryKey: ['admin', 'user-emails', userIds.sort().join(',')],
    queryFn: async () => {
      if (!adminKey || !apiKey || !userIds.length) {
        return {}
      }
      
      const client = new AdminApiClient({ adminKey, apiKey })
      return client.getUserEmails(userIds)
    },
    enabled: Boolean(adminKey && apiKey && userIds.length > 0),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  })
}
