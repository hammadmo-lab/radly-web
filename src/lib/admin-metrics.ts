/**
 * src/lib/admin-metrics.ts
 * Fetches metrics from the protected backend endpoints.
 * Uses the same API configuration as other admin endpoints.
 */
import { apiFetch } from './api';

export async function fetchLLMMetrics() {
  const res = await apiFetch('/admin/metrics/llm');
  if (!res.ok) {
    const txt = await res.text().catch(() => 'no body');
    throw new Error('Failed to fetch LLM metrics: ' + txt);
  }
  return res.json();
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
}

export async function fetchDashboardMetrics(timeRange: string = '5m'): Promise<DashboardMetrics> {
  const res = await apiFetch(`/admin/metrics/dashboard?range=${timeRange}`);
  if (!res.ok) {
    const txt = await res.text().catch(() => 'no body');
    throw new Error('Failed to fetch dashboard metrics: ' + txt);
  }
  return res.json();
}
