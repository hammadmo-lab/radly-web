/**
 * src/lib/metrics-helpers.ts
 * Helper functions for processing and formatting metrics data
 */
import {
  PrometheusResult,
  PrometheusTimeSeriesResult,
  DashboardMetrics,
  MetricWithTrend,
  Alert,
  MetricThresholds
} from './admin-metrics';

/**
 * Convert Prometheus query result to chart-friendly format
 */
export function parsePrometheusResult(result: PrometheusResult | undefined) {
  if (!result || !result.data || !result.data.result) {
    return [];
  }
  return result.data.result.map(item => ({
    name: item.metric.stage || item.metric.provider || item.metric.category || 'unknown',
    value: parseFloat(item.value[1]),
    timestamp: item.value[0],
    labels: item.metric,
  }));
}

/**
 * Convert Prometheus time-series result to chart-friendly format
 */
export function parsePrometheusTimeSeries(result: PrometheusTimeSeriesResult | undefined) {
  if (!result || !result.data || !result.data.result) {
    return [];
  }

  return result.data.result.map(series => ({
    name: series.metric.stage || series.metric.provider || series.metric.category || 'unknown',
    data: series.values.map(([timestamp, value]) => ({
      x: timestamp * 1000, // Convert to milliseconds
      y: parseFloat(value),
    })),
    labels: series.metric,
  }));
}

/**
 * Calculate metric trend from current and previous values
 */
export function calculateMetricTrend(
  current: number,
  previous: number,
  sparklineData?: number[]
): MetricWithTrend {
  const changeAbsolute = current - previous;
  const change = previous !== 0 ? (changeAbsolute / previous) * 100 : 0;

  const threshold = 0.5; // 0.5% change threshold
  const trend: 'up' | 'down' | 'neutral' =
    Math.abs(change) < threshold ? 'neutral' :
    change > 0 ? 'up' : 'down';

  return {
    current,
    previous,
    change,
    changeAbsolute,
    trend,
    sparkline: sparklineData,
    timestamp: Date.now(),
  };
}

/**
 * Extract sparkline data from time-series result
 */
export function extractSparkline(
  result: PrometheusTimeSeriesResult | undefined,
  seriesName?: string,
  maxPoints: number = 20
): number[] {
  if (!result || !result.data || !result.data.result) {
    return [];
  }

  let series = result.data.result[0];

  // If seriesName is provided, find the matching series
  if (seriesName) {
    series = result.data.result.find(s =>
      s.metric.stage === seriesName ||
      s.metric.provider === seriesName ||
      s.metric.category === seriesName
    ) || series;
  }

  if (!series || !series.values) {
    return [];
  }

  // Take last N points
  const values = series.values.slice(-maxPoints);
  return values.map(([_, value]) => parseFloat(value));
}

/**
 * Calculate percentage with color coding
 */
export function getStatusColor(value: number, thresholds: {
  success: number;
  warning: number;
}): 'success' | 'warning' | 'danger' {
  if (value >= thresholds.success) return 'success';
  if (value >= thresholds.warning) return 'warning';
  return 'danger';
}

/**
 * Format currency
 */
export function formatCost(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  return `${(seconds / 60).toFixed(1)}m`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get stage color for job stage timing charts
 */
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    dequeue: '#8b5cf6',      // Purple
    validation: '#06b6d4',   // Cyan
    llm_call: '#f59e0b',     // Amber
    post_processing: '#10b981', // Green
    storage: '#3b82f6',      // Blue
  };
  return colors[stage] || '#6b7280'; // Gray fallback
}

/**
 * Get provider color for LLM metrics
 */
export function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    openai: '#74aa9c',       // Teal
    anthropic: '#d4a574',    // Sand
    gemini: '#4285f4',       // Blue
    claude: '#d4a574',       // Sand (same as anthropic)
  };
  return colors[provider.toLowerCase()] || '#6b7280'; // Gray fallback
}

/**
 * Get error category color
 */
export function getErrorCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    timeout: '#ef4444',      // Red
    rate_limit: '#f59e0b',   // Amber
    validation: '#3b82f6',   // Blue
    internal: '#8b5cf6',     // Purple
    external: '#06b6d4',     // Cyan
  };
  return colors[category.toLowerCase()] || '#6b7280'; // Gray fallback
}

/**
 * Calculate trend direction
 */
export function calculateTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
  const threshold = 0.05; // 5% change threshold
  const change = (current - previous) / previous;
  
  if (change > threshold) return 'up';
  if (change < -threshold) return 'down';
  return 'neutral';
}

/**
 * Get default metric thresholds
 */
export function getDefaultThresholds(): MetricThresholds {
  return {
    sla_compliance: { success: 99, warning: 95, critical: 90 },
    queue_saturation: { success: 60, warning: 75, critical: 85 },
    error_rate: { success: 1, warning: 2, critical: 5 },
    cache_hit_rate: { success: 85, warning: 70, critical: 50 },
    response_time: { success: 1, warning: 3, critical: 5 },
  };
}

/**
 * Generate alerts with actionable recommendations
 */
export function generateAlerts(metrics: DashboardMetrics | undefined): Alert[] {
  const alerts: Alert[] = [];

  if (!metrics) {
    return alerts;
  }

  const thresholds = metrics.thresholds || getDefaultThresholds();

  // Queue saturation alerts
  const queueSaturation = parsePrometheusResult(metrics.queue_saturation)[0]?.value || 0;
  if (queueSaturation >= thresholds.queue_saturation.critical) {
    alerts.push({
      type: 'error',
      message: `Queue saturation critical at ${formatPercentage(queueSaturation)}`,
      metric: 'queue_saturation',
      value: queueSaturation,
      threshold: thresholds.queue_saturation.critical,
      recommendation: 'Scale up workers immediately or pause new job intake. Check for stuck jobs.',
      timestamp: Date.now(),
    });
  } else if (queueSaturation >= thresholds.queue_saturation.warning) {
    alerts.push({
      type: 'warning',
      message: `Queue saturation elevated at ${formatPercentage(queueSaturation)}`,
      metric: 'queue_saturation',
      value: queueSaturation,
      threshold: thresholds.queue_saturation.warning,
      recommendation: 'Monitor queue closely. Consider scaling workers if trend continues.',
      timestamp: Date.now(),
    });
  }

  // SLA compliance alerts
  const slaCompliance = parsePrometheusResult(metrics.sla_compliance)[0]?.value || 0;
  if (slaCompliance < thresholds.sla_compliance.critical) {
    alerts.push({
      type: 'error',
      message: `SLA compliance critical at ${formatPercentage(slaCompliance)}`,
      metric: 'sla_compliance',
      value: slaCompliance,
      threshold: thresholds.sla_compliance.critical,
      recommendation: 'Investigate slow jobs immediately. Check LLM provider latency and worker health.',
      timestamp: Date.now(),
    });
  } else if (slaCompliance < thresholds.sla_compliance.warning) {
    alerts.push({
      type: 'warning',
      message: `SLA compliance below target at ${formatPercentage(slaCompliance)}`,
      metric: 'sla_compliance',
      value: slaCompliance,
      threshold: thresholds.sla_compliance.warning,
      recommendation: 'Review job stage timings to identify bottlenecks.',
      timestamp: Date.now(),
    });
  }

  // Error rate alerts
  const errorRate = parsePrometheusResult(metrics.error_rate)[0]?.value || 0;
  if (errorRate >= thresholds.error_rate.critical) {
    alerts.push({
      type: 'error',
      message: `Error rate critical at ${formatPercentage(errorRate)}`,
      metric: 'error_rate',
      value: errorRate,
      threshold: thresholds.error_rate.critical,
      recommendation: 'Check error categories. May indicate LLM provider issues or configuration errors.',
      timestamp: Date.now(),
    });
  } else if (errorRate >= thresholds.error_rate.warning) {
    alerts.push({
      type: 'warning',
      message: `Error rate elevated at ${formatPercentage(errorRate)}`,
      metric: 'error_rate',
      value: errorRate,
      threshold: thresholds.error_rate.warning,
      recommendation: 'Monitor error categories and retry success rate.',
      timestamp: Date.now(),
    });
  }

  // Cache hit rate alerts
  const cacheHitRate = parsePrometheusResult(metrics.cache_hit_rate)[0]?.value || 0;
  if (cacheHitRate < thresholds.cache_hit_rate.critical) {
    alerts.push({
      type: 'warning',
      message: `Cache hit rate low at ${formatPercentage(cacheHitRate)}`,
      metric: 'cache_hit_rate',
      value: cacheHitRate,
      threshold: thresholds.cache_hit_rate.critical,
      recommendation: 'Check Redis health. Low cache hits increase LLM costs and latency.',
      timestamp: Date.now(),
    });
  } else if (cacheHitRate < thresholds.cache_hit_rate.warning) {
    alerts.push({
      type: 'info',
      message: `Cache hit rate could be improved: ${formatPercentage(cacheHitRate)}`,
      metric: 'cache_hit_rate',
      value: cacheHitRate,
      threshold: thresholds.cache_hit_rate.warning,
      recommendation: 'Review cache TTL settings and cache key strategies.',
      timestamp: Date.now(),
    });
  }

  // Rate limit alerts
  const rateLimits = parsePrometheusResult(metrics.rate_limits);
  const totalRateLimits = rateLimits.reduce((sum, item) => sum + item.value, 0);
  if (totalRateLimits > 10) {
    alerts.push({
      type: 'warning',
      message: `High rate limit hits: ${totalRateLimits} in period`,
      metric: 'rate_limits',
      value: totalRateLimits,
      threshold: 10,
      recommendation: 'Consider increasing rate limits with LLM providers or implementing better request distribution.',
      timestamp: Date.now(),
    });
  }

  return alerts.sort((a, b) => {
    // Sort by severity: error > warning > info
    const severityOrder = { error: 0, warning: 1, info: 2 };
    return severityOrder[a.type] - severityOrder[b.type];
  });
}
