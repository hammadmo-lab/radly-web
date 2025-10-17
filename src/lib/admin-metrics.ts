/**
 * src/lib/admin-metrics.ts
 * Fetches LLM metrics from the protected backend endpoint.
 * Server must enforce admin-only access at /v1/admin/metrics/llm.
 */
export async function fetchLLMMetrics() {
  const res = await fetch('/v1/admin/metrics/llm', { credentials: 'include' });
  if (!res.ok) {
    const txt = await res.text().catch(() => 'no body');
    throw new Error('Failed to fetch LLM metrics: ' + txt);
  }
  return res.json();
}
