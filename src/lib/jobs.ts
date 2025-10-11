// src/lib/jobs.ts
'use client';

import { edgeFetch } from './edge';

// Types used in UI
export type RecentJobRow = {
  job_id: string;
  status: 'queued' | 'running' | 'done' | 'error';
  template_id?: string | null;
  created_at?: number;
};

export type CreateJobPayload = {
  // match backend expectations
  template_id?: string; // if you have templated flows
  report?: Record<string, unknown>;
  patient?: Record<string, unknown>;
  findings?: string;
  impression?: string;
  recommendations?: string;
  // include any other fields your backend expects
};

export async function createJob(payload: CreateJobPayload) {
  // MUST be POST
  const res = await edgeFetch<{ job_id: string; status: string }>(
    '/v1/generate/async',
    {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    }
  );
  return res;
}

export async function getJob(jobId: string) {
  return edgeFetch<{ job_id: string; status: RecentJobRow['status'] }>(
    `/v1/jobs/${encodeURIComponent(jobId)}`,
    { method: 'GET', auth: true }
  );
}

export async function getRecentJobs(limit = 50) {
  return edgeFetch<RecentJobRow[]>(
    `/v1/jobs/recent?limit=${encodeURIComponent(limit)}`,
    { method: 'GET', auth: true }
  );
}

export async function getQueueStats() {
  return edgeFetch<{ queue_depth: number; jobs_running: number }>(
    '/v1/queue/stats',
    { method: 'GET', auth: true }
  );
}

// Type exports for compatibility
export type JobStatusResponse = {
  job_id: string;
  status: RecentJobRow['status'];
  result?: Record<string, unknown>;
  error?: string;
};