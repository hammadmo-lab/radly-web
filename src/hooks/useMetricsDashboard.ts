/**
 * src/hooks/useMetricsDashboard.ts
 * Custom hook for metrics dashboard data fetching and management
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics } from '@/lib/admin-metrics';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminCredentials } from '@/types/admin';

export function useMetricsDashboard(timeRange: string = '5m') {
  const { adminKey, apiKey } = useAdminAuth();

  const credentials: AdminCredentials | null = adminKey && apiKey
    ? { adminKey, apiKey }
    : null;

  return useQuery({
    queryKey: ['metrics-dashboard', timeRange, credentials],
    queryFn: () => {
      if (!credentials) {
        throw new Error('Admin credentials not available');
      }
      return fetchDashboardMetrics(credentials, timeRange);
    },
    enabled: !!credentials, // Only run query if credentials exist
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
