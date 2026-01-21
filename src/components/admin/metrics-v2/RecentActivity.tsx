/**
 * src/components/admin/metrics-v2/RecentActivity.tsx
 * Activity feed showing recent events
 */
'use client';

import React from 'react';
import { FileText, UserPlus, RefreshCw } from 'lucide-react';
import type { RecentActivityItem, ActivityType } from '@/types/metrics-summary.types';

interface RecentActivityProps {
    data: RecentActivityItem[];
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
    report: <FileText className="h-4 w-4" />,
    signup: <UserPlus className="h-4 w-4" />,
    subscription_change: <RefreshCw className="h-4 w-4" />,
};

const activityColors: Record<ActivityType, { bg: string; icon: string }> = {
    report: {
        bg: 'rgba(245, 215, 145, 0.12)',
        icon: '#F5D791',
    },
    signup: {
        bg: 'rgba(59, 130, 246, 0.12)',
        icon: '#3b82f6',
    },
    subscription_change: {
        bg: 'rgba(139, 92, 246, 0.12)',
        icon: '#8b5cf6',
    },
};

const activityLabels: Record<ActivityType, string> = {
    report: 'Report',
    signup: 'New Signup',
    subscription_change: 'Subscription',
};

export function RecentActivity({ data }: RecentActivityProps) {
    if (data.length === 0) {
        return (
            <div className="aurora-card flex h-full items-center justify-center border border-[rgba(255,255,255,0.08)] p-6">
                <p className="text-sm text-[rgba(207,207,207,0.55)]">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-[rgba(207,207,207,0.55)]">
                Recent Activity
            </h3>
            <div className="space-y-3">
                {data.map((item, index) => {
                    const colors = activityColors[item.type] || activityColors.report;
                    const icon = activityIcons[item.type] || activityIcons.report;
                    const label = activityLabels[item.type] || 'Activity';

                    return (
                        <div
                            key={`${item.type}-${item.timestamp}-${index}`}
                            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                        >
                            <div
                                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                                style={{ backgroundColor: colors.bg }}
                            >
                                <span style={{ color: colors.icon }}>{icon}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-[rgba(207,207,207,0.9)]">
                                        {label}
                                    </span>
                                    <span className="text-sm text-[rgba(207,207,207,0.55)]">
                                        {item.detail}
                                    </span>
                                </div>
                                <span className="text-xs text-[rgba(207,207,207,0.45)]">
                                    {item.time_ago}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
