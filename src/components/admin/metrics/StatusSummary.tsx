"use client"

/**
 * src/components/admin/metrics/StatusSummary.tsx
 * Top-level system health summary with status indicator
 */
import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert } from '@/lib/admin-metrics';

interface StatusSummaryProps {
  alerts: Alert[];
  uptime?: number;
  className?: string;
}

const STATUS_STYLES = {
  healthy: {
    iconWrapper: 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.18)] text-[#7AE7B4]',
    border: 'border-[rgba(63,191,140,0.28)]',
    badge: 'text-[#C8F3E2]',
    label: 'All Systems Operational',
    description: 'Every service responded within healthy thresholds.',
  },
  degraded: {
    iconWrapper: 'border-[rgba(248,183,77,0.35)] bg-[rgba(248,183,77,0.16)] text-[#FBE3B5]',
    border: 'border-[rgba(248,183,77,0.28)]',
    badge: 'text-[#FBE3B5]',
    label: 'System Degraded',
    description: 'Some metrics need attention to avoid regressions.',
  },
  critical: {
    iconWrapper: 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]',
    border: 'border-[rgba(255,107,107,0.32)]',
    badge: 'text-[#FFD1D1]',
    label: 'Critical Alerts Active',
    description: 'Immediate action required to stabilize the system.',
  },
};

export function StatusSummary({ alerts, uptime, className }: StatusSummaryProps) {
  const criticalAlerts = alerts.filter((alert) => alert.type === 'error');
  const warningAlerts = alerts.filter((alert) => alert.type === 'warning');

  const status: keyof typeof STATUS_STYLES =
    criticalAlerts.length > 0
      ? 'critical'
      : warningAlerts.length > 2
        ? 'degraded'
        : 'healthy';

  const config = STATUS_STYLES[status];
  const Icon = status === 'critical' ? AlertCircle : status === 'degraded' ? AlertTriangle : CheckCircle2;

  return (
    <div
      className={cn(
        'aurora-card border p-6 sm:p-7 transition-shadow hover:shadow-[0_18px_42px_rgba(20,28,45,0.5)]',
        config.border,
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border', config.iconWrapper)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <div>
              <h2 className={cn('text-2xl font-semibold text-white', config.badge)}>{config.label}</h2>
              <p className="mt-1 text-sm text-[rgba(207,207,207,0.65)]">{config.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
              <span className="flex items-center gap-2 text-[rgba(207,207,207,0.6)]">
                <Activity className="h-4 w-4 text-[#4B8EFF]" />
                Uptime:{' '}
                <span className="font-semibold text-white">
                  {formatUptime(uptime)}
                </span>
              </span>

              {criticalAlerts.length > 0 && (
                <span className="flex items-center gap-2 text-[#FFD1D1]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#FF6B6B]" />
                  {criticalAlerts.length} Critical
                </span>
              )}

              {warningAlerts.length > 0 && (
                <span className="flex items-center gap-2 text-[#FBE3B5]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#F8B74D]" />
                  {warningAlerts.length} Warning
                </span>
              )}
            </div>
          </div>
        </div>

        {status === 'healthy' && alerts.length === 0 && (
          <div className="flex flex-col items-end gap-2 text-right text-[rgba(207,207,207,0.65)]">
            <div className="text-4xl">✨</div>
            <span className="text-xs uppercase tracking-[0.18em]">Perfect health</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatUptime(seconds?: number) {
  if (!seconds) return 'N/A';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
