/**
 * src/components/admin/metrics/MetricsLoading.tsx
 * Loading component for metrics dashboard
 */
import React from 'react';
import { RefreshCw } from 'lucide-react';

export function MetricsLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <div className="text-gray-600 text-lg">Loading metrics...</div>
        <div className="text-gray-500 text-sm mt-2">
          Fetching real-time data from Prometheus
        </div>
      </div>
    </div>
  );
}
