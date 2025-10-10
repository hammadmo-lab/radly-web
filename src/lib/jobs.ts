import { api } from './api';

export type RecentJobsResp = { jobs: any[]; count: number };
export type JobStatus = 'queued'|'running'|'done'|'error';
export type JobStatusResp = { job_id: string; status: JobStatus; result?: any; error?: string };

export async function recent(limit = 50) {
  return api.getJson<RecentJobsResp>(`/v1/jobs/recent?limit=${limit}`);
}

export async function status(jobId: string) {
  return api.getJson<JobStatusResp>(`/v1/jobs/${jobId}`);
}
