// src/types/jobs.ts

export type JobStatusType = 'queued' | 'running' | 'done' | 'error' | 'unknown';

export interface EnqueueResponse {
  job_id: string;
  status: JobStatusType;
}

export interface GenerateMetadata {
  retries?: number;
  finish_reason?: string | null;
  usage?: {
    prompt_tokens?: number | null;
    completion_tokens?: number | null;
    total_tokens?: number | null;
    reasoning_tokens?: number | null;
  } | null;
}

export interface GenerateResponseDTO {
  report: {
    title: string;
    technique: string;
    findings: string;
    impression: string;
    recommendations?: string;
  };
  ui_banner: string;
  template_id: string;
  provider: string;
  model: string;
  elapsed_ms: number;
  metadata: GenerateMetadata;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatusType;
  result?: GenerateResponseDTO;
  error?: string;
}

export interface RecentJobRow {
  job_id: string;
  template_id: string;
  user_id?: string;
  status: JobStatusType | string;
  created_at: string;          // ISO timestamp
  finished_at?: string | null; // ISO timestamp or null
}

export interface RecentJobsResponse {
  jobs: RecentJobRow[];
  count: number;
}
