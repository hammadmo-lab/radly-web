/**
 * src/components/admin/metrics-v2/SummaryDashboard.tsx
 * Main dashboard container for the new metrics page
 */
'use client';

import React from 'react';
import { RefreshCw, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useMetricsSummary } from '@/hooks/useMetricsSummary';
import { KeyMetricCards } from './KeyMetricCards';
import { UsageTrendChart } from './UsageTrendChart';
import { SubscriptionMix } from './SubscriptionMix';
import { TopTemplates } from './TopTemplates';
import { RecentActivity } from './RecentActivity';
import { SystemHealthPanel } from './SystemHealthPanel';

function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-12 bg-[rgba(255,255,255,0.05)] rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-[rgba(255,255,255,0.05)] rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 h-64 bg-[rgba(255,255,255,0.05)] rounded-xl" />
                <div className="h-64 bg-[rgba(255,255,255,0.05)] rounded-xl" />
            </div>
        </div>
    );
}

export function SummaryDashboard() {
    const router = useRouter();
    const { data, isLoading, error, refetch, dataUpdatedAt } = useMetricsSummary();

    const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

    const handleRefresh = () => {
        refetch();
    };

    if (isLoading && !data) {
        return <DashboardLoading />;
    }

    if (error && !data) {
        return (
            <div className="rounded-2xl border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.12)] p-6">
                <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="text-lg font-semibold text-white">Error loading metrics</div>
                        <div className="mt-2 text-sm text-[#FFD1D1]">
                            {error.message.includes('404')
                                ? 'The metrics summary endpoint is not available. Please ensure the backend is running.'
                                : error.message}
                        </div>
                        <Button
                            onClick={handleRefresh}
                            className="mt-4 h-10 rounded-lg border border-[rgba(255,255,255,0.12)] bg-transparent px-4 text-[#FFD1D1] hover:border-[rgba(255,107,107,0.45)] hover:bg-[rgba(255,107,107,0.12)]"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-10 text-center">
                <p className="text-lg font-semibold text-white">No metrics data available</p>
                <p className="mt-2 text-sm text-[rgba(207,207,207,0.55)]">
                    Try refreshing the dashboard or verify that the backend is reporting.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin')}
                        className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] px-4 text-[rgba(207,207,207,0.8)] hover:border-[#F5D791]/40 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Admin
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-white">Metrics Dashboard</h1>
                        <div className="mt-1 flex items-center text-sm text-[rgba(207,207,207,0.55)]">
                            <Clock className="mr-2 h-4 w-4 text-[#F5D791]" />
                            Last updated:{' '}
                            <span className="ml-1 font-medium text-white">
                                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="h-10 rounded-xl border border-[rgba(245,215,145,0.35)] bg-[rgba(245,215,145,0.12)] px-4 text-[#F5D791] hover:border-[rgba(245,215,145,0.45)] hover:bg-[rgba(245,215,145,0.18)] disabled:opacity-50"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stale data warning */}
            {error && data && (
                <div className="rounded-xl border border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.08)] px-4 py-3">
                    <p className="text-sm text-[#eab308]">
                        Data may be stale. Last successful update:{' '}
                        {lastUpdated ? lastUpdated.toLocaleString() : 'Unknown'}
                    </p>
                </div>
            )}

            {/* Row 1: Key Metric Cards */}
            <KeyMetricCards data={data} />

            {/* Row 2: Usage Trend + Subscription Mix */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <UsageTrendChart data={data.usage_trend} />
                </div>
                <SubscriptionMix data={data.subscriptions} />
            </div>

            {/* Row 3: Top Templates + Recent Activity */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TopTemplates data={data.top_templates} />
                <RecentActivity data={data.recent_activity} />
            </div>

            {/* Row 4: System Health */}
            <SystemHealthPanel data={data.system_health} />
        </div>
    );
}
