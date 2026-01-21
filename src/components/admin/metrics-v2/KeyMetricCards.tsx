/**
 * src/components/admin/metrics-v2/KeyMetricCards.tsx
 * Four KPI cards showing key metrics at a glance
 */
'use client';

import React from 'react';
import { FileText, Users, DollarSign, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricsSummary, HealthStatus } from '@/types/metrics-summary.types';

interface KeyMetricCardsProps {
    data: MetricsSummary;
}

// Color scheme for system health status
const healthColors: Record<HealthStatus, { bg: string; border: string; text: string; dot: string }> = {
    healthy: {
        bg: 'rgba(34, 197, 94, 0.12)',
        border: 'rgba(34, 197, 94, 0.35)',
        text: '#22c55e',
        dot: '#22c55e',
    },
    degraded: {
        bg: 'rgba(234, 179, 8, 0.12)',
        border: 'rgba(234, 179, 8, 0.35)',
        text: '#eab308',
        dot: '#eab308',
    },
    critical: {
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.35)',
        text: '#ef4444',
        dot: '#ef4444',
    },
};

function formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtext: React.ReactNode;
    iconColor: string;
    iconBg: string;
}

function MetricCard({ icon, title, value, subtext, iconColor, iconBg }: MetricCardProps) {
    return (
        <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.15)]">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-[rgba(207,207,207,0.55)]">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                    <div className="mt-2 text-sm text-[rgba(207,207,207,0.7)]">{subtext}</div>
                </div>
                <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: iconBg }}
                >
                    <span style={{ color: iconColor }}>{icon}</span>
                </div>
            </div>
        </div>
    );
}

export function KeyMetricCards({ data }: KeyMetricCardsProps) {
    const { reports, users, revenue, system_health } = data;

    // Calculate change indicator for reports
    const reportsChange = reports.change_vs_yesterday;
    const reportsChangeText = reportsChange > 0
        ? `+${reportsChange} vs yesterday`
        : reportsChange < 0
            ? `${reportsChange} vs yesterday`
            : 'Same as yesterday';
    const reportsChangeColor = reportsChange > 0 ? '#22c55e' : reportsChange < 0 ? '#ef4444' : '#6b7280';
    const ReportsChangeIcon = reportsChange > 0 ? TrendingUp : reportsChange < 0 ? TrendingDown : null;

    // Revenue growth indicator
    const revenueGrowth = revenue.growth_percent;
    const revenueChangeText = revenueGrowth > 0
        ? `+${revenueGrowth.toFixed(1)}% vs last month`
        : revenueGrowth < 0
            ? `${revenueGrowth.toFixed(1)}% vs last month`
            : 'Same as last month';
    const revenueColor = revenueGrowth > 0 ? '#22c55e' : revenueGrowth < 0 ? '#ef4444' : '#6b7280';
    const RevenueChangeIcon = revenueGrowth > 0 ? TrendingUp : revenueGrowth < 0 ? TrendingDown : null;

    // System health status
    const healthStatus = system_health.status;
    const healthStyle = healthColors[healthStatus];
    const healthLabel = healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Reports Today */}
            <MetricCard
                icon={<FileText className="h-5 w-5" />}
                title="Reports Today"
                value={reports.today === 0 ? 'No reports yet' : reports.today}
                subtext={
                    <span className="flex items-center gap-1" style={{ color: reportsChangeColor }}>
                        {ReportsChangeIcon && <ReportsChangeIcon className="h-3.5 w-3.5" />}
                        {reportsChangeText}
                    </span>
                }
                iconColor="#F5D791"
                iconBg="rgba(245, 215, 145, 0.16)"
            />

            {/* Active Users */}
            <MetricCard
                icon={<Users className="h-5 w-5" />}
                title="Active Users"
                value={users.active_this_week}
                subtext={`of ${users.total} total`}
                iconColor="#3b82f6"
                iconBg="rgba(59, 130, 246, 0.16)"
            />

            {/* Revenue MTD */}
            <MetricCard
                icon={<DollarSign className="h-5 w-5" />}
                title="Revenue MTD"
                value={formatCurrency(revenue.this_month, revenue.currency)}
                subtext={
                    <span className="flex items-center gap-1" style={{ color: revenueColor }}>
                        {RevenueChangeIcon && <RevenueChangeIcon className="h-3.5 w-3.5" />}
                        {revenueChangeText}
                    </span>
                }
                iconColor="#22c55e"
                iconBg="rgba(34, 197, 94, 0.16)"
            />

            {/* System Status */}
            <MetricCard
                icon={<Activity className="h-5 w-5" />}
                title="System Status"
                value={healthLabel}
                subtext={
                    <span className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthStyle.dot }}
                        />
                        All systems operational
                    </span>
                }
                iconColor={healthStyle.text}
                iconBg={healthStyle.bg}
            />
        </div>
    );
}
