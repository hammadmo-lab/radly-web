/**
 * src/components/admin/metrics/AlertsPanel.tsx
 * Active alerts with actionable recommendations and recent history
 */
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateAlerts } from '@/lib/metrics-helpers';
import { DashboardMetrics, Alert as MetricAlert } from '@/lib/admin-metrics';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  metrics: DashboardMetrics | undefined;
}

interface AlertItemProps {
  alert: MetricAlert;
}

function AlertItem({ alert }: AlertItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      case 'info':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'error': return 'Critical';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
      default: return 'Info';
    }
  };

  return (
    <Alert variant={getAlertVariant(alert.type)} className="relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {getAlertIcon(alert.type)}
            <AlertTitle className="text-sm font-semibold">
              {getTypeLabel(alert.type)}
            </AlertTitle>
            <span className="text-xs text-gray-500">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <AlertDescription className="mt-2">
            {alert.message}
          </AlertDescription>

          {alert.recommendation && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs p-0 h-auto font-normal hover:bg-transparent"
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                {showDetails ? 'Hide' : 'Show'} recommendation
                {showDetails ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>

              {showDetails && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                  <div className="font-medium mb-1">Recommended Action:</div>
                  {alert.recommendation}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-4 text-right text-xs text-gray-500">
          <div>Value: <span className="font-medium">{alert.value.toFixed(1)}</span></div>
          <div>Threshold: <span className="font-medium">{alert.threshold.toFixed(1)}</span></div>
        </div>
      </div>
    </Alert>
  );
}

export function AlertsPanel({ metrics }: AlertsPanelProps) {
  const alerts = generateAlerts(metrics);
  const [showResolved, setShowResolved] = useState(false);

  // Mock recent resolved alerts (in real implementation, this would come from backend)
  const mockResolvedAlerts = alerts.length === 0 ? [
    {
      message: 'Queue saturation spike',
      resolvedAt: Date.now() - 10800000, // 3 hours ago
      duration: '15 minutes',
    },
  ] : [];

  if (alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          System Health: Excellent
        </h3>

        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded">
          <div>
            <p className="text-green-800 font-medium">No active alerts</p>
            <p className="text-sm text-green-600 mt-1">
              All metrics within normal thresholds
            </p>
          </div>
          <div className="text-5xl">✨</div>
        </div>

        {mockResolvedAlerts.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {showResolved ? 'Hide' : 'Show'} recent resolved alerts
              {showResolved ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>

            {showResolved && (
              <div className="mt-3 space-y-2">
                {mockResolvedAlerts.map((resolved, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">{resolved.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Resolved {new Date(resolved.resolvedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-6">
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

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          <span>Active Alerts ({alerts.length})</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-normal">
          {alerts.filter(a => a.type === 'error').length > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
              {alerts.filter(a => a.type === 'error').length} Critical
            </span>
          )}
          {alerts.filter(a => a.type === 'warning').length > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">
              {alerts.filter(a => a.type === 'warning').length} Warning
            </span>
          )}
        </div>
      </h3>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <AlertItem key={index} alert={alert} />
        ))}
      </div>
    </div>
  );
}
