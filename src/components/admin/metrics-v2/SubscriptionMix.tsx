/**
 * src/components/admin/metrics-v2/SubscriptionMix.tsx
 * Donut chart showing subscription tier breakdown
 */
'use client';

import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    type TooltipItem,
    type ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { SubscriptionsMetrics } from '@/types/metrics-summary.types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SubscriptionMixProps {
    data: SubscriptionsMetrics;
}

// Tier colors as specified
const tierColors = {
    free: '#9ca3af',       // gray
    starter: '#3b82f6',    // blue
    professional: '#8b5cf6', // purple
    premium: '#f59e0b',    // gold
};

export function SubscriptionMix({ data }: SubscriptionMixProps) {
    const { chartData, total, tierEntries } = useMemo(() => {
        // Defensive: handle missing or malformed data
        const safeCount = (tier: { count?: number } | undefined) => {
            if (!tier || typeof tier.count !== 'number' || isNaN(tier.count)) {
                return 0;
            }
            return tier.count;
        };

        const entries = [
            { key: 'free', display_name: data?.free?.display_name || 'Free', count: safeCount(data?.free), color: tierColors.free },
            { key: 'starter', display_name: data?.starter?.display_name || 'Starter', count: safeCount(data?.starter), color: tierColors.starter },
            { key: 'professional', display_name: data?.professional?.display_name || 'Professional', count: safeCount(data?.professional), color: tierColors.professional },
            { key: 'premium', display_name: data?.premium?.display_name || 'Premium', count: safeCount(data?.premium), color: tierColors.premium },
        ];

        const totalCount = entries.reduce((sum, tier) => sum + tier.count, 0);

        return {
            chartData: {
                labels: entries.map((t) => t.display_name),
                datasets: [
                    {
                        data: entries.map((t) => t.count),
                        backgroundColor: entries.map((t) => t.color),
                        borderColor: 'rgba(12, 14, 24, 1)',
                        borderWidth: 2,
                        hoverOffset: 8,
                    },
                ],
            },
            total: totalCount,
            tierEntries: entries,
        };
    }, [data]);

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(12, 14, 24, 0.95)',
                titleColor: '#fff',
                bodyColor: 'rgba(207, 207, 207, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context: TooltipItem<'doughnut'>) => {
                        const value = context.raw as number;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                        return `${context.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    if (total === 0) {
        return (
            <div className="aurora-card flex h-full items-center justify-center border border-[rgba(255,255,255,0.08)] p-6">
                <p className="text-sm text-[rgba(207,207,207,0.55)]">No subscription data</p>
            </div>
        );
    }

    return (
        <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-[rgba(207,207,207,0.55)]">
                Subscription Mix
            </h3>
            <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div className="relative h-40 w-40 flex-shrink-0">
                    <Doughnut data={chartData} options={options} />
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold text-white">{total}</span>
                        <span className="text-xs text-[rgba(207,207,207,0.55)]">Total</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2">
                    {tierEntries.map((tier) => {
                        const percentage = total > 0 ? ((tier.count / total) * 100).toFixed(0) : 0;
                        return (
                            <div key={tier.key} className="flex items-center gap-2">
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: tier.color }}
                                />
                                <span className="text-sm text-[rgba(207,207,207,0.85)]">
                                    {tier.display_name}: {tier.count} ({percentage}%)
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
