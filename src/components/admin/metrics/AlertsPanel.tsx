"use client"

/**
 * src/components/admin/metrics/AlertsPanel.tsx
 * Active alerts with actionable recommendations and recent history
 */
import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateAlerts } from '@/lib/metrics-helpers';
import { DashboardMetrics, Alert as MetricAlert } from '@/lib/admin-metrics';

interface AlertsPanelProps {
  metrics: DashboardMetrics | undefined;
}

interface AlertItemProps {
  alert: MetricAlert;
}

const ALERT_TONES: Record<
  MetricAlert['type'],
  {
    container: string;
    iconWrapper: string;
    text: string;
    accent: string;
    label: string;
    icon: React.ElementType;
  }
> = {
  error: {
    container: 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.12)]',
    iconWrapper: 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]',
    text: 'text-[#FFD1D1]',
    accent: '#FFD1D1',
    label: 'Critical',
    icon: AlertCircle,
  },
  warning: {
    container: 'border-[rgba(248,183,77,0.35)] bg-[rgba(248,183,77,0.16)]',
    iconWrapper: 'border-[rgba(248,183,77,0.35)] bg-[rgba(248,183,77,0.18)] text-[#FBE3B5]',
    text: 'text-[#FBE3B5]',
    accent: '#FBE3B5',
    label: 'Warning',
    icon: AlertTriangle,
  },
  info: {
    container: 'border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)]',
    iconWrapper: 'border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.18)] text-[#D7E3FF]',
    text: 'text-[#D7E3FF]',
    accent: '#D7E3FF',
    label: 'Info',
    icon: Info,
  },
};

function AlertItem({ alert }: AlertItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const tone = ALERT_TONES[alert.type] ?? ALERT_TONES.info;
  const Icon = tone.icon;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,28,45,0.55)]',
        tone.container
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', tone.iconWrapper)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className={cn('text-xs font-semibold uppercase tracking-[0.22em]', tone.text)}>
                  {tone.label}
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.55)]">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-white">{alert.message}</p>
            </div>
          </div>

          {alert.recommendation && (
            <div className="pl-12 sm:pl-12">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails((prev) => !prev)}
                className="h-auto px-0 text-xs font-medium text-[rgba(255,255,255,0.75)] hover:text-white"
              >
                <Lightbulb className="mr-2 h-3.5 w-3.5 text-[#FBE3B5]" />
                {showDetails ? 'Hide recommendation' : 'Show recommendation'}
                {showDetails ? (
                  <ChevronUp className="ml-2 h-3 w-3 text-[rgba(255,255,255,0.65)]" />
                ) : (
                  <ChevronDown className="ml-2 h-3 w-3 text-[rgba(255,255,255,0.65)]" />
                )}
              </Button>

              {showDetails && (
                <div className="mt-3 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.7)] p-3 text-sm text-[rgba(207,207,207,0.75)]">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
                    Recommended Action
                  </div>
                  {alert.recommendation}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.5)] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
          <div>
            Value:{' '}
            <span className="font-semibold text-white">{alert.value.toFixed(1)}</span>
          </div>
          <div className="mt-1">
            Threshold:{' '}
            <span className="font-semibold text-white">{alert.threshold.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertsPanel({ metrics }: AlertsPanelProps) {
  const alerts = generateAlerts(metrics);
  const [showResolved, setShowResolved] = useState(false);

  const mockResolvedAlerts =
    alerts.length === 0
      ? [
          {
            message: 'Queue saturation spike',
            resolvedAt: Date.now() - 10800000,
            duration: '15 minutes',
          },
        ]
      : [];

  if (alerts.length === 0) {
    return (
      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.18)] text-[#C8F3E2]">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">System Health: Excellent</h3>
              <p className="text-sm text-[rgba(207,207,207,0.65)]">No active alerts reported.</p>
            </div>
          </div>
          <div className="text-5xl">✨</div>
        </div>

        {mockResolvedAlerts.length > 0 && (
          <div className="mt-6 border-t border-[rgba(255,255,255,0.06)] pt-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolved((prev) => !prev)}
              className="h-auto px-0 text-xs font-medium text-[rgba(255,255,255,0.75)] hover:text-white"
            >
              <Clock className="mr-2 h-3.5 w-3.5 text-[#D7E3FF]" />
              {showResolved ? 'Hide recent resolved alerts' : 'Show recent resolved alerts'}
              {showResolved ? (
                <ChevronUp className="ml-2 h-3 w-3 text-[rgba(255,255,255,0.65)]" />
              ) : (
                <ChevronDown className="ml-2 h-3 w-3 text-[rgba(255,255,255,0.65)]" />
              )}
            </Button>

            {showResolved && (
              <div className="mt-3 space-y-3">
                {mockResolvedAlerts.map((resolved, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.6)] p-3 text-sm text-[rgba(207,207,207,0.75)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#7AE7B4]" />
                        <span>{resolved.message}</span>
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
                        Resolved {new Date(resolved.resolvedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 ml-6 text-xs text-[rgba(207,207,207,0.45)]">
                      Duration: {resolved.duration}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const criticalCount = alerts.filter((alert) => alert.type === 'error').length;
  const warningCount = alerts.filter((alert) => alert.type === 'warning').length;

  return (
    <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 sm:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">Active Alerts ({alerts.length})</h3>
          <p className="text-sm text-[rgba(207,207,207,0.65)]">
            Prioritize critical issues to keep the system stable.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em]">
          {criticalCount > 0 && (
            <span className="rounded-full border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] px-3 py-1 font-semibold text-[#FFD1D1]">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full border border-[rgba(248,183,77,0.35)] bg-[rgba(248,183,77,0.16)] px-3 py-1 font-semibold text-[#FBE3B5]">
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertItem key={`${alert.type}-${alert.timestamp}`} alert={alert} />
        ))}
      </div>
    </div>
  );
}
