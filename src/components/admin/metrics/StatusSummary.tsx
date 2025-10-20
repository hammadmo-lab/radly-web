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

export function StatusSummary({ alerts, uptime, className }: StatusSummaryProps) {
  const criticalAlerts = alerts.filter(a => a.type === 'error');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  const status: 'healthy' | 'degraded' | 'critical' =
    criticalAlerts.length > 0 ? 'critical' :
    warningAlerts.length > 2 ? 'degraded' :
    'healthy';

  const statusConfig = {
    healthy: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'All Systems Operational',
      description: 'All metrics within normal thresholds',
    },
    degraded: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'System Degraded',
      description: 'Some metrics require attention',
    },
    critical: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Critical Alerts Active',
      description: 'Immediate action required',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatUptime = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={cn(
      'p-6 rounded-lg border-2',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={cn('p-3 rounded-full', config.bgColor)}>
            <Icon className={cn('h-8 w-8', config.color)} />
          </div>

          <div className="flex-1">
            <h2 className={cn('text-2xl font-bold mb-1', config.color)}>
              {config.label}
            </h2>
            <p className="text-gray-600 mb-4">{config.description}</p>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Uptime: <span className="font-medium text-gray-900">{formatUptime(uptime)}</span>
                </span>
              </div>

              {alerts.length > 0 && (
                <>
                  {criticalAlerts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-gray-600">
                        <span className="font-medium text-red-600">{criticalAlerts.length}</span> Critical
                      </span>
                    </div>
                  )}
                  {warningAlerts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-gray-600">
                        <span className="font-medium text-amber-600">{warningAlerts.length}</span> Warning
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {status === 'healthy' && alerts.length === 0 && (
          <div className="text-right">
            <div className="text-6xl mb-2">✨</div>
            <p className="text-xs text-gray-500">Perfect health</p>
          </div>
        )}
      </div>
    </div>
  );
}
