/**
 * src/components/admin/metrics/MetricsDashboard.tsx
 * Main dashboard container component
 */
import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMetricsDashboard } from '@/hooks/useMetricsDashboard';
import { OverviewCards } from './OverviewCards';
import { JobStageChart } from './JobStageChart';
import { LLMMetricsPanel } from './LLMMetricsPanel';
import { ReliabilityPanel } from './ReliabilityPanel';
import { QueueMetricsChart } from './QueueMetricsChart';
import { DatabaseMetricsChart } from './DatabaseMetricsChart';
import { AlertsPanel } from './AlertsPanel';
import { UserMetricsPanel } from './UserMetricsPanel';
import { MetricsLoading } from './MetricsLoading';

const TIME_RANGES = [
  { value: '5m', label: 'Last 5 minutes' },
  { value: '15m', label: 'Last 15 minutes' },
  { value: '1h', label: 'Last hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
];

export function MetricsDashboard() {
  const [timeRange, setTimeRange] = useState('5m');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data, isLoading, error, refetch } = useMetricsDashboard(timeRange);

  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data]);

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: data,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radly-metrics-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <MetricsLoading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-800 font-semibold mb-2">Error loading metrics</div>
        <div className="text-red-600">{error.message}</div>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">No metrics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metrics Dashboard</h1>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards data={data} />

      {/* Alerts */}
      <AlertsPanel metrics={data} />

      {/* Job Stage Timing */}
      <JobStageChart data={data.job_stages} />

      {/* LLM Metrics */}
      <LLMMetricsPanel 
        tokensData={data.llm_tokens} 
        costData={data.llm_cost_hourly} 
      />

      {/* Reliability Metrics */}
      <ReliabilityPanel 
        errorCategories={data.error_categories}
        cacheHitRate={data.cache_hit_rate}
        retrySuccessRate={data.retry_success_rate}
      />

      {/* Queue Metrics */}
      <QueueMetricsChart 
        queueRates={data.queue_rates}
        queueSaturation={data.queue_saturation}
      />

      {/* Database Metrics */}
      <DatabaseMetricsChart data={data.db_pool_usage} />

      {/* User Metrics */}
      <UserMetricsPanel 
        userJobSuccess={data.user_job_success}
        rateLimits={data.rate_limits}
      />
    </div>
  );
}
