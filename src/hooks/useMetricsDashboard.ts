/**
 * src/hooks/useMetricsDashboard.ts
 * Custom hook for metrics dashboard data fetching and management
 */
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics } from '@/lib/admin-metrics';

export function useMetricsDashboard(timeRange: string = '5m') {
  return useQuery({
    queryKey: ['metrics-dashboard', timeRange],
    queryFn: () => fetchDashboardMetrics(timeRange),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
