/**
 * src/components/admin/metrics/OverviewCards.tsx
 * Enhanced overview KPI cards with trends, targets, and sparklines
 */
import React, { useMemo } from 'react';
import { MetricCard } from './MetricCard';
import { ResponsiveGrid } from './ResponsiveGrid';
import { Shield, Database, DollarSign, AlertTriangle } from 'lucide-react';
import {
  formatCost,
  formatPercentage,
  getStatusColor,
  parsePrometheusResult,
  extractSparkline,
  calculateMetricTrend,
  getDefaultThresholds
} from '@/lib/metrics-helpers';
import { DashboardMetrics } from '@/lib/admin-metrics';

interface OverviewCardsProps {
  data: DashboardMetrics;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const thresholds = data.thresholds || getDefaultThresholds();

  // Parse current values
  const slaCompliance = parsePrometheusResult(data.sla_compliance)[0]?.value || 0;
  const queueSaturation = parsePrometheusResult(data.queue_saturation)[0]?.value || 0;
  const hourlyCost = parsePrometheusResult(data.llm_cost_hourly)[0]?.value || 0;
  const errorRate = parsePrometheusResult(data.error_rate)[0]?.value || 0;

  // Extract sparklines from time-series data (if available)
  const slaSparkline = useMemo(() =>
    extractSparkline(data.job_stages_timeseries, undefined, 15),
    [data.job_stages_timeseries]
  );

  const queueSparkline = useMemo(() =>
    extractSparkline(data.queue_rates_timeseries, undefined, 15),
    [data.queue_rates_timeseries]
  );

  const costSparkline = useMemo(() =>
    extractSparkline(data.llm_cost_timeseries, undefined, 15),
    [data.llm_cost_timeseries]
  );

  // Calculate trends (mock previous values - in real implementation, backend provides these)
  const slaTrend = useMemo(() => {
    if (slaSparkline && slaSparkline.length >= 2) {
      const previous = slaSparkline[slaSparkline.length - 2];
      return calculateMetricTrend(slaCompliance, previous, slaSparkline);
    }
    return null;
  }, [slaCompliance, slaSparkline]);

  const queueTrend = useMemo(() => {
    if (queueSparkline && queueSparkline.length >= 2) {
      const previous = queueSparkline[queueSparkline.length - 2];
      return calculateMetricTrend(queueSaturation, previous, queueSparkline);
    }
    return null;
  }, [queueSaturation, queueSparkline]);

  const costTrend = useMemo(() => {
    if (costSparkline && costSparkline.length >= 2) {
      const previous = costSparkline[costSparkline.length - 2];
      return calculateMetricTrend(hourlyCost, previous, costSparkline);
    }
    return null;
  }, [hourlyCost, costSparkline]);

  // Calculate average response time from job stages
  const avgResponseTime = useMemo(() => {
    const jobStages = parsePrometheusResult(data.job_stages);
    if (jobStages.length === 0) return 0;
    return jobStages.reduce((sum, stage) => sum + stage.value, 0);
  }, [data.job_stages]);

  return (
    <ResponsiveGrid
      cols={{ default: 1, sm: 2, lg: 4 }}
      className="mb-8"
    >
      <MetricCard
        title="SLA Compliance"
        value={formatPercentage(slaCompliance)}
        status={getStatusColor(slaCompliance, { success: thresholds.sla_compliance.success, warning: thresholds.sla_compliance.warning })}
        icon={<Shield className="h-5 w-5" />}
        change={slaTrend?.change}
        changeAbsolute={slaTrend?.changeAbsolute}
        period="vs previous period"
        target={`${thresholds.sla_compliance.success}%`}
        targetLabel="Target"
        sparkline={slaSparkline}
        description="Percentage of jobs completed within SLA timeframe (P95 < 60s)"
        subtitle={avgResponseTime > 0 ? `Avg response: ${avgResponseTime.toFixed(2)}s` : undefined}
      />

      <MetricCard
        title="Queue Saturation"
        value={formatPercentage(queueSaturation)}
        status={getStatusColor(queueSaturation, { success: thresholds.queue_saturation.success, warning: thresholds.queue_saturation.warning })}
        icon={<Database className="h-5 w-5" />}
        change={queueTrend?.change}
        changeAbsolute={queueTrend?.changeAbsolute}
        period="vs previous period"
        trendInverse={true}
        target={`<${thresholds.queue_saturation.warning}%`}
        targetLabel="Safe threshold"
        sparkline={queueSparkline}
        description="Current queue utilization percentage. High saturation may cause delays."
      />

      <MetricCard
        title="Hourly LLM Cost"
        value={formatCost(hourlyCost)}
        status={hourlyCost > 100 ? 'warning' : 'success'}
        icon={<DollarSign className="h-5 w-5" />}
        change={costTrend?.change}
        changeAbsolute={costTrend?.changeAbsolute}
        period="vs previous hour"
        trendInverse={true}
        sparkline={costSparkline}
        description="Total cost of LLM API calls in the current hour across all providers"
        subtitle={data.cost_efficiency ? `Per job: ${formatCost(data.cost_efficiency.costPerJob)}` : undefined}
      />

      <MetricCard
        title="Error Rate"
        value={formatPercentage(errorRate)}
        status={getStatusColor(errorRate, { success: thresholds.error_rate.success, warning: thresholds.error_rate.warning })}
        icon={<AlertTriangle className="h-5 w-5" />}
        trendInverse={true}
        target={`<${thresholds.error_rate.warning}%`}
        targetLabel="Target"
        description="Percentage of jobs that failed due to errors in the selected time period"
      />
    </ResponsiveGrid>
  );
}
