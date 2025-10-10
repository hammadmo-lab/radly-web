// src/lib/jobs.ts
import { api } from '@/lib/api';
import type { EnqueueResponse, JobStatusResponse, RecentJobsResponse } from '@/types/jobs';

export interface GenerateRequestPayload {
  template_id: string;
  patient?: {
    name?: string | null;
    mrn?: string | null;
    age?: number | null;
    dob?: string | null;
    sex?: string | null;
    history?: string | null;
  };
  findings_text?: string | null;
  history?: string | null;
  technique?: string | null;
  options?: Record<string, unknown>;
}

export const jobs = {
  async enqueue(payload: GenerateRequestPayload): Promise<{ data: EnqueueResponse | null; error?: string }> {
    const res = await api.post<EnqueueResponse>('/v1/generate/async', payload);
    return {
      data: res.data,
      error: res.error?.message
    };
  },

  async status(jobId: string): Promise<{ data: JobStatusResponse | null; error?: string }> {
    const res = await api.get<JobStatusResponse>(`/v1/jobs/${jobId}`);
    return {
      data: res.data,
      error: res.error?.message
    };
  },

  async recent(limit = 50): Promise<{ data: RecentJobsResponse | null; error?: string }> {
    const res = await api.get<RecentJobsResponse>(`/v1/jobs/recent?limit=${encodeURIComponent(String(limit))}`);
    return {
      data: res.data,
      error: res.error?.message
    };
  },
};
