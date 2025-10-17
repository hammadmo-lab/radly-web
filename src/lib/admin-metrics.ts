/**
 * src/lib/admin-metrics.ts
 * Fetches LLM metrics from the protected backend endpoint.
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
