/**
 * src/components/admin/metrics/AlertsPanel.tsx
 * Active alerts based on metric thresholds
 */
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { generateAlerts } from '@/lib/metrics-helpers';
import { DashboardMetrics } from '@/lib/admin-metrics';

interface AlertsPanelProps {
  metrics: DashboardMetrics | undefined;
}

export function AlertsPanel({ metrics }: AlertsPanelProps) {
  const alerts = generateAlerts(metrics);

  if (alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-2">✓</div>
            <div className="text-gray-600">All systems healthy</div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        Active Alerts ({alerts.length})
      </h3>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <Alert key={index} variant={getAlertVariant(alert.type)}>
            <div className="flex items-center">
              {getAlertIcon(alert.type)}
              <AlertTitle className="ml-2">
                {alert.type === 'error' ? 'Critical' : 
                 alert.type === 'warning' ? 'Warning' : 'Info'}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-1">
              {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}
