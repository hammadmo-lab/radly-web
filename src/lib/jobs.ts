import { httpPost, httpGet } from '@/lib/http';
import type { EnqueueInput } from '@/types/api';
import type { JobStatusResponse } from '@/types/jobs';

export type RecentJobRow = {
  job_id: string;
  status: string;
  template_id?: string;
  result?: Record<string, unknown>;
  error?: string;
};

function toISO(d?: string | null): string | null {
  if (!d) return null;

  // Match DD/MM/YYYY or DD-MM-YYYY format (as expected by schema)
  const m = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const [ , dd, mm, y ] = m;
    const yyyy = y.length === 2 ? `20${y}` : y;
    // DD/MM/YYYY format: first group is day, second is month
    return `${yyyy.padStart(4,'0')}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }

  // Fallback: try parsing as ISO date string (YYYY-MM-DD)
  const isoMatch = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return d;
  }

  return null;
}

export async function enqueueJob(input: EnqueueInput): Promise<{ job_id: string }> {
  const body: Record<string, unknown> = {
    template_id: input.templateId,
    findings: input.findings,
  };
  if (input.indication?.trim()) body.indication = input.indication.trim();
  if (input.impression?.trim()) body.impression = input.impression.trim();
  if (input.technique?.trim()) body.technique = input.technique.trim();

  if (input.patient) {
    const p: Record<string, unknown> = {};
    if (input.patient.name?.trim()) p.name = input.patient.name.trim();
    if (input.patient.age != null) p.age = Number(input.patient.age);
    if (input.patient.sex) p.sex = input.patient.sex;
    if (input.patient.mrn?.trim()) p.mrn = input.patient.mrn.trim();
    const dob = toISO(input.patient.dob || null);
    if (dob) p.dob = dob;

    // Populate history from indication if not already provided
    // This ensures clinical indication appears in DOCX exports
    if (input.patient.history?.trim()) {
      p.history = input.patient.history.trim();
    } else if (input.indication?.trim()) {
      // Use indication as clinical history for radiology reports
      p.history = input.indication.trim();
    }

    if (Object.keys(p).length) body.patient = p;
  }

  if (input.signature) {
    const s: Record<string, unknown> = {};
    if (input.signature.name?.trim()) s.name = input.signature.name.trim();
    const sd = toISO(input.signature.date || null);
    if (sd) s.date = sd;
    if (Object.keys(s).length) body.signature = s;
  }

  return httpPost<Record<string, unknown>, { job_id: string }>('/v1/generate/async', body);
}

// Backend API response type for recent jobs endpoint
interface RecentJobsResponse {
  jobs: Array<{
    job_id: string;
    template_id: string;
    status: 'done' | 'queued' | 'processing' | 'error';
    created_at: string;
    completed_at?: string;
    processing_time_ms?: number;
  }>;
  count: number;
}

/**
 * Fetch recent jobs from backend API
 * Note: Backend returns wrapped object with 'jobs' array
 */
export const getRecentJobs = (limit = 50): Promise<RecentJobRow[]> =>
  httpGet<RecentJobsResponse>(`/v1/jobs/recent?limit=${limit}`)
    .then(response => {
      // Extract jobs array from wrapper
      return response.jobs.map(job => ({
        job_id: job.job_id,
        status: job.status,
        template_id: job.template_id,
      }));
    });

export const getJob = (id: string) =>
  httpGet<JobStatusResponse>(`/v1/jobs/${encodeURIComponent(id)}`);

export const getQueueStats = () =>
  httpGet<{ queue_depth: number; jobs_running: number }>('/v1/queue/stats');

// Type exports for compatibility
export type { JobStatusResponse };
