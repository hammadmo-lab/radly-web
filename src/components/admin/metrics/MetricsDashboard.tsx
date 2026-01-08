/**
 * src/components/admin/metrics/MetricsDashboard.tsx
 * Main dashboard container component
 */
import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { RefreshCw, Download, Clock, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMetricsDashboard } from '@/hooks/useMetricsDashboard';
import { useRouter } from 'next/navigation';
import { OverviewCards } from './OverviewCards';
import { JobStageChart } from './JobStageChart';
import { LLMMetricsPanel } from './LLMMetricsPanel';
import { ReliabilityPanel } from './ReliabilityPanel';
import { QueueMetricsChart } from './QueueMetricsChart';
import { DatabaseMetricsChart } from './DatabaseMetricsChart';
import { AlertsPanel } from './AlertsPanel';
import { UserMetricsPanel } from './UserMetricsPanel';
import { MetricsLoading } from './MetricsLoading';
import { StatusSummary } from './StatusSummary';
import { generateAlerts, parsePrometheusResult } from '@/lib/metrics-helpers';
import { DashboardMetrics } from '@/lib/admin-metrics';

const TIME_RANGES = [
  { value: '5m', label: 'Last 5 minutes' },
  { value: '15m', label: 'Last 15 minutes' },
  { value: '1h', label: 'Last hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
];

/**
 * Detect if we're in a low traffic period (most metrics are zero or missing)
 */
function isLowTrafficPeriod(data: DashboardMetrics | undefined): boolean {
  if (!data) return false;

  // Parse available metrics
  const jobStages = parsePrometheusResult(data.job_stages);
  const llmTokens = parsePrometheusResult(data.llm_tokens);
  const queueRates = parsePrometheusResult(data.queue_rates);

  // Count how many job stages have zero timing
  const zeroStages = jobStages.filter(s => s.value === 0).length;
  const totalStages = jobStages.length;

  // Count how many LLM token metrics are zero
  const zeroTokens = llmTokens.filter(t => t.value === 0).length;
  const totalTokens = llmTokens.length;

  // Check if queue rates are all zero
  const allQueueRatesZero = queueRates.length > 0 && queueRates.every(r => r.value === 0);

  // If most metrics are zero, it's low traffic
  const mostStagesZero = totalStages > 0 && zeroStages / totalStages > 0.7;
  const mostTokensZero = totalTokens > 0 && zeroTokens / totalTokens > 0.7;

  return allQueueRatesZero && (mostStagesZero || mostTokensZero);
}

export function MetricsDashboard() {
  const [timeRange, setTimeRange] = useState('5m');
  const router = useRouter();

  const { data, isLoading, error, refetch } = useMetricsDashboard(timeRange);

  // Derive lastUpdated from data changes instead of storing in state
  // Note: We re-create the date object whenever data changes to trigger a re-render
  const lastUpdated = useMemo(() => new Date(), [data ? data.system_health?.uptime : 0]);

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
      <div className="rounded-2xl border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.12)] p-6 text-[#FFD1D1]">
        <div className="text-lg font-semibold text-white">Error loading metrics</div>
        <div className="mt-2 text-sm">
          {error.message.includes('404') 
            ? 'The metrics dashboard endpoint is not yet implemented on the backend. Please contact your administrator.'
            : error.message
          }
        </div>
        <div className="mt-4 text-xs uppercase tracking-[0.18em] text-[rgba(255,209,209,0.7)]">
          Expected endpoint: <code className="ml-1 font-mono text-[rgba(255,209,209,0.9)]">/v1/admin/metrics/dashboard</code>
        </div>
        <Button
          onClick={handleRefresh}
          className="mt-6 h-10 rounded-lg border border-[rgba(255,255,255,0.12)] bg-transparent px-4 text-[#FFD1D1] hover:border-[rgba(255,107,107,0.45)] hover:bg-[rgba(255,107,107,0.12)]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-10 text-center text-sm text-[rgba(207,207,207,0.65)]">
        <p className="text-lg font-semibold text-white">No metrics data available</p>
        <p className="mt-2 text-sm text-[rgba(207,207,207,0.55)]">
          Try refreshing the dashboard or verify that the metrics backend is reporting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] px-4 text-[rgba(207,207,207,0.8)] hover:border-[#4B8EFF]/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-white">Metrics Dashboard</h1>
            <div className="mt-1 flex items-center text-sm text-[rgba(207,207,207,0.55)]">
              <Clock className="mr-2 h-4 w-4 text-[#4B8EFF]" />
              Last updated: <span className="ml-1 font-medium text-white">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-11 w-48 rounded-xl border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.75)] hover:border-[#4B8EFF]/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,14,24,0.95)] text-white">
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="h-10 rounded-xl border border-[rgba(255,255,255,0.12)] px-4 text-[rgba(207,207,207,0.8)] hover:border-[#4B8EFF]/40 hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={handleExport}
            variant="ghost"
            size="sm"
            className="h-10 rounded-xl border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] px-4 text-[#D7E3FF] hover:border-[rgba(75,142,255,0.45)] hover:bg-[rgba(75,142,255,0.22)]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <StatusSummary
        alerts={generateAlerts(data)}
        uptime={data.system_health?.uptime}
      />

      {/* Low Traffic Info Banner */}
      {isLowTrafficPeriod(data) && (
        <div className="aurora-card border border-[rgba(75,142,255,0.28)] bg-[rgba(75,142,255,0.08)] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)]">
              <Info className="h-5 w-5 text-[#4B8EFF]" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">Low Traffic Period Detected</h3>
              <p className="mt-1.5 text-sm text-[rgba(207,207,207,0.7)]">
                Some metrics may show zeros or be incomplete due to low system activity in the selected time range.
                {timeRange === '5m' && (
                  <> Try selecting a longer time range (15m or 1h) for more meaningful data, or generate some test jobs to populate the metrics.</>
                )}
              </p>
              {timeRange === '5m' && (
                <Button
                  onClick={() => setTimeRange('15m')}
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-9 rounded-lg border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.12)] px-4 text-[#D7E3FF] hover:border-[rgba(75,142,255,0.45)] hover:bg-[rgba(75,142,255,0.18)]"
                >
                  Switch to 15m Range
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
