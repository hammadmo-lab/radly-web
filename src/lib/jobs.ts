import { getJson } from './api';

export type RecentJobsResp = { jobs: unknown[]; count: number };
export type JobStatusResp = { job_id: string; status: 'queued'|'running'|'done'|'error'; result?: unknown; error?: string };

export async function recent(limit = 50) {
  return getJson<RecentJobsResp>(`/v1/jobs/recent?limit=${limit}`);
}

export async function status(jobId: string) {
  return getJson<JobStatusResp>(`/v1/jobs/${jobId}`);
}
