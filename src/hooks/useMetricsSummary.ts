/**
 * src/hooks/useMetricsSummary.ts
 * Custom hook for fetching database-backed metrics summary
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMetricsSummary } from '@/lib/admin-metrics';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import type { AdminCredentials } from '@/types/admin';
import type { MetricsSummary } from '@/types/metrics-summary.types';

export function useMetricsSummary() {
    const { adminKey, apiKey } = useAdminAuth();

    const credentials: AdminCredentials | null = adminKey && apiKey
        ? { adminKey, apiKey }
        : null;

    return useQuery<MetricsSummary, Error>({
        queryKey: ['metrics-summary', credentials?.adminKey],
        queryFn: () => {
            if (!credentials) {
                throw new Error('Admin credentials not available');
            }
            return fetchMetricsSummary(credentials);
        },
        enabled: !!credentials,
        refetchInterval: 60000, // Refresh every 60 seconds
        staleTime: 55000, // Consider stale after 55 seconds
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
