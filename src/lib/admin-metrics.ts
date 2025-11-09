/**
 * src/lib/admin-metrics.ts
 * Fetches metrics from the protected backend endpoints.
 * Must be called from admin pages where AdminAuthProvider has authenticated credentials.
 * Use AdminApiClient for all admin endpoint calls.
 */
import { AdminCredentials } from '@/types/admin';

/**
 * Helper to create fetch headers with admin credentials
 */
function getAdminHeaders(credentials: AdminCredentials) {
  if (!credentials?.adminKey || !credentials?.apiKey) {
    throw new Error('Admin credentials not available. Please log in first.');
  }

  return {
    'Content-Type': 'application/json',
    'x-admin-key': credentials.adminKey,
    'Authorization': `Bearer ${credentials.apiKey}`,
    'X-Request-Id': crypto.randomUUID(),
  };
}

export async function fetchLLMMetrics(credentials: AdminCredentials) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  const response = await fetch(`${baseUrl}/v1/admin/metrics/llm`, {
    method: 'GET',
    headers: getAdminHeaders(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => 'no body');
    throw new Error('Failed to fetch LLM metrics: ' + txt);
  }
  return response.json();
}

// Dashboard metrics types
export interface PrometheusResult {
  data: {
    result: Array<{
      metric: Record<string, string>;
      value: [number, string];
    }>;
  };
}

// Time-series Prometheus result (for range queries)
export interface PrometheusTimeSeriesResult {
  data: {
    result: Array<{
      metric: Record<string, string>;
      values: Array<[number, string]>; // Array of [timestamp, value]
    }>;
  };
}

// Enhanced metric with trend information
export interface MetricWithTrend {
  current: number;
  previous: number;
  change: number; // Percentage change
  changeAbsolute: number;
  trend: 'up' | 'down' | 'neutral';
  sparkline?: number[]; // Last N values for mini chart
  timestamp: number;
}

// Alert with actionable recommendations
export interface Alert {
  type: 'error' | 'warning' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  recommendation?: string;
  actionUrl?: string;
  timestamp: number;
}

// Configurable thresholds
export interface MetricThresholds {
  sla_compliance: { success: number; warning: number; critical: number };
  queue_saturation: { success: number; warning: number; critical: number };
  error_rate: { success: number; warning: number; critical: number };
  cache_hit_rate: { success: number; warning: number; critical: number };
  response_time: { success: number; warning: number; critical: number };
}

// System health summary
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  activeAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  lastIncident?: {
    metric: string;
    timestamp: number;
    resolved: boolean;
  };
  uptime: number;
}

// Cost efficiency metrics
export interface CostEfficiency {
  costPerJob: number;
  costPerThousandTokens: number;
  providerComparison: Array<{
    provider: string;
    avgCost: number;
    tokenEfficiency: number;
  }>;
}

export interface DashboardMetrics {
  job_stages: PrometheusResult;
  llm_cost_hourly: PrometheusResult;
  llm_tokens: PrometheusResult;
  cache_hit_rate: PrometheusResult;
  error_categories: PrometheusResult;
  sla_compliance: PrometheusResult;
  queue_saturation: PrometheusResult;
  queue_rates: PrometheusResult;
  db_pool_usage: PrometheusResult;
  retry_success_rate: PrometheusResult;
  user_job_success: PrometheusResult;
  rate_limits: PrometheusResult;
  error_rate?: PrometheusResult;

  // Time-series data (for showing trends over time)
  job_stages_timeseries?: PrometheusTimeSeriesResult;
  llm_cost_timeseries?: PrometheusTimeSeriesResult;
  llm_tokens_timeseries?: PrometheusTimeSeriesResult;
  queue_rates_timeseries?: PrometheusTimeSeriesResult;

  // Enhanced metrics (computed on backend)
  system_health?: SystemHealth;
  cost_efficiency?: CostEfficiency;
  thresholds?: MetricThresholds;

  // Metadata
  timestamp?: number;
  range?: string;
}

export async function fetchDashboardMetrics(credentials: AdminCredentials, timeRange: string = '5m'): Promise<DashboardMetrics> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  const response = await fetch(`${baseUrl}/v1/admin/metrics/dashboard?range=${timeRange}`, {
    method: 'GET',
    headers: getAdminHeaders(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => 'no body');
    throw new Error('Failed to fetch dashboard metrics: ' + txt);
  }
  return response.json();
}
