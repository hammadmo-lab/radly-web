/**
 * src/lib/metrics-helpers.ts
 * Helper functions for processing and formatting metrics data
 */
import { PrometheusResult, DashboardMetrics } from './admin-metrics';

/**
 * Convert Prometheus query result to chart-friendly format
 */
export function parsePrometheusResult(result: PrometheusResult) {
  return result.data.result.map(item => ({
    name: item.metric.stage || item.metric.provider || item.metric.category || 'unknown',
    value: parseFloat(item.value[1]),
    timestamp: item.value[0],
    labels: item.metric,
  }));
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
 * Generate alert status based on metric values
 */
export function generateAlerts(metrics: DashboardMetrics) {
  const alerts: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    metric: string;
  }> = [];

  // Queue saturation > 80%
  const queueSaturation = parsePrometheusResult(metrics.queue_saturation)[0]?.value || 0;
  if (queueSaturation > 80) {
    alerts.push({
      type: 'error',
      message: `Queue saturation is ${formatPercentage(queueSaturation)}`,
      metric: 'queue_saturation',
    });
  }

  // SLA compliance < 95%
  const slaCompliance = parsePrometheusResult(metrics.sla_compliance)[0]?.value || 0;
  if (slaCompliance < 95) {
    alerts.push({
      type: 'error',
      message: `SLA compliance is ${formatPercentage(slaCompliance)}`,
      metric: 'sla_compliance',
    });
  }

  // Cache hit rate < 80%
  const cacheHitRate = parsePrometheusResult(metrics.cache_hit_rate)[0]?.value || 0;
  if (cacheHitRate < 80) {
    alerts.push({
      type: 'warning',
      message: `Cache hit rate is ${formatPercentage(cacheHitRate)}`,
      metric: 'cache_hit_rate',
    });
  }

  return alerts;
}
