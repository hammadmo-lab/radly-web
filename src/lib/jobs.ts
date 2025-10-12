import { httpPost, httpGet } from '@/lib/http';
import type { EnqueueInput } from '@/types/api';

export type RecentJobRow = { job_id: string; status: string; template_id?: string };

function toISO(d?: string | null): string | null {
  if (!d) return null;
  const t = Date.parse(d);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0,10);
  const m = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const [ , a, b, y ] = m;
    const mm = parseInt(a,10) > 12 ? b : a;
    const dd = parseInt(a,10) > 12 ? a : b;
    const yyyy = y.length === 2 ? `20${y}` : y;
    return `${yyyy.padStart(4,'0')}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
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
    if (input.patient.history?.trim()) p.history = input.patient.history.trim();
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

export const getRecentJobs = (limit = 50) =>
  httpGet<RecentJobRow[]>(`/v1/jobs/recent?limit=${limit}`);

export const getJob = (id: string) =>
  httpGet<RecentJobRow>(`/v1/jobs/${encodeURIComponent(id)}`);

export const getQueueStats = () =>
  httpGet<{ queue_depth: number; jobs_running: number }>('/v1/queue/stats');

// Type exports for compatibility
export type JobStatusResponse = {
  job_id: string;
  status: string;
  result?: Record<string, unknown>;
  error?: string;
};