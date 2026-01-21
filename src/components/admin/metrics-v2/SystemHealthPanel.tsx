/**
 * src/components/admin/metrics-v2/SystemHealthPanel.tsx
 * Collapsible panel showing system component health
 */
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Server, Database, Cpu } from 'lucide-react';
import type { SystemHealth, HealthStatus } from '@/types/metrics-summary.types';

interface SystemHealthPanelProps {
    data: SystemHealth;
}

const statusColors: Record<HealthStatus, { bg: string; border: string; text: string; dot: string }> = {
    healthy: {
        bg: 'rgba(34, 197, 94, 0.08)',
        border: 'rgba(34, 197, 94, 0.25)',
        text: '#22c55e',
        dot: '#22c55e',
    },
    degraded: {
        bg: 'rgba(234, 179, 8, 0.08)',
        border: 'rgba(234, 179, 8, 0.25)',
        text: '#eab308',
        dot: '#eab308',
    },
    critical: {
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.25)',
        text: '#ef4444',
        dot: '#ef4444',
    },
};

function StatusBadge({ status }: { status: HealthStatus }) {
    const colors = statusColors[status];
    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
            }}
        >
            <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: colors.dot }}
            />
            {label}
        </span>
    );
}

interface ComponentRowProps {
    icon: React.ReactNode;
    name: string;
    status: HealthStatus;
    detail?: string;
}

function ComponentRow({ icon, name, status, detail }: ComponentRowProps) {
    const colors = statusColors[status];

    return (
        <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-4 py-3">
            <div className="flex items-center gap-3">
                <span style={{ color: colors.text }}>{icon}</span>
                <span className="text-sm font-medium text-[rgba(207,207,207,0.9)]">{name}</span>
                {detail && (
                    <span className="text-xs text-[rgba(207,207,207,0.5)]">({detail})</span>
                )}
            </div>
            <StatusBadge status={status} />
        </div>
    );
}

export function SystemHealthPanel({ data }: SystemHealthPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { components } = data;

    const overallColors = statusColors[data.status];

    return (
        <div
            className="aurora-card border transition-all duration-200"
            style={{
                borderColor: overallColors.border,
                backgroundColor: overallColors.bg,
            }}
        >
            {/* Header - always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-[rgba(245,215,145,0.4)] focus:ring-offset-2 focus:ring-offset-[rgba(12,14,24,1)] rounded-xl"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-[rgba(207,207,207,0.55)]">
                        System Health
                    </h3>
                    <StatusBadge status={data.status} />
                </div>
                <span className="text-[rgba(207,207,207,0.55)]">
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                    ) : (
                        <ChevronDown className="h-5 w-5" />
                    )}
                </span>
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="space-y-2 px-5 pb-5">
                    <ComponentRow
                        icon={<Server className="h-4 w-4" />}
                        name="Redis"
                        status={components.redis.status}
                        detail={`Queue: ${components.redis.queue_depth}`}
                    />
                    <ComponentRow
                        icon={<Database className="h-4 w-4" />}
                        name="Database"
                        status={components.database.status}
                    />
                    <ComponentRow
                        icon={<Cpu className="h-4 w-4" />}
                        name="Workers"
                        status={components.workers.status}
                        detail={`${components.workers.running_jobs} running`}
                    />
                </div>
            )}
        </div>
    );
}
