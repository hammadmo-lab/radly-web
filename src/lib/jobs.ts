import { httpGet, httpPost } from '@/lib/http';

export type RecentJobRow = { job_id: string; status: string; template_id?: string };

export function enqueueJob(payload: { template_id: string; report: any; patient: any; }) {
  return httpPost<{ job_id: string; status: string }>('/v1/generate/async', { json: payload });
}

export const getRecentJobs = (limit = 50) =>
  httpGet<RecentJobRow[]>(`/v1/jobs/recent?limit=${limit}`);

export const getJob = (id: string) =>
  httpGet<RecentJobRow>(`/v1/jobs/${encodeURIComponent(id)}`);

export const getQueueStats = () =>
  httpGet('/v1/queue/stats');

// Type exports for compatibility
export type JobStatusResponse = {
  job_id: string;
  status: string;
  result?: Record<string, unknown>;
  error?: string;
};