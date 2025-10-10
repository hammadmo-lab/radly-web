// src/lib/jobs.ts
import { z } from "zod";

const EDGE = process.env.NEXT_PUBLIC_EDGE_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_CLIENT_KEY!;

export type AuthHeaders = Record<string, string>;

const EnqueueResp = z.object({
  job_id: z.string(),
  status: z.string()
});

const JobResult = z.object({
  // shape of your backend result; keep loose but typed
  report: z.any(),
  patient: z.any().optional(),
  ui_banner: z.string().optional(),
  template_id: z.string(),
  provider: z.string(),
  model: z.string(),
  elapsed_ms: z.number(),
  metadata: z.record(z.any()).optional(),
});

const JobStatus = z.union([
  z.literal("queued"),
  z.literal("running"),
  z.literal("done"),
  z.literal("error"),
  z.literal("unknown"),
]);

const JobStatusResp = z.object({
  job_id: z.string(),
  status: JobStatus,
  result: JobResult.optional(),
  error: z.string().optional(),
});

export type EnqueueResponse = z.infer<typeof EnqueueResp>;
export type JobStatusResponse = z.infer<typeof JobStatusResp>;

export type GeneratePayload = {
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
};

export async function enqueueJob(
  body: GeneratePayload,
  authHeaders?: AuthHeaders
): Promise<EnqueueResponse> {
  const url = `${EDGE}/v1/generate/async`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "x-client-key": CLIENT_KEY,
      "Content-Type": "application/json",
      ...(authHeaders ?? {}),
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`enqueue failed ${resp.status}`);
  }
  const data = await resp.json();
  return EnqueueResp.parse(data);
}

export async function getJob(jobId: string, authHeaders?: AuthHeaders): Promise<JobStatusResponse> {
  const url = `${EDGE}/v1/jobs/${jobId}`;
  const resp = await fetch(url, {
    headers: {
      "x-client-key": CLIENT_KEY,
      ...(authHeaders ?? {}),
    },
    cache: "no-store",
  });
  if (!resp.ok) {
    throw new Error(`job fetch failed ${resp.status}`);
  }
  const data = await resp.json();
  return JobStatusResp.parse(data);
}

const RecentJobRow = z.object({
  job_id: z.string(),
  template_id: z.string().optional(),
  status: JobStatus,
  created_at: z.string().optional(),
});
export type RecentJobRow = z.infer<typeof RecentJobRow>;

export async function getRecentJobs(limit = 50, authHeaders?: AuthHeaders): Promise<RecentJobRow[]> {
  const url = `${EDGE}/v1/jobs/recent?limit=${limit}`;
  const resp = await fetch(url, {
    headers: {
      "x-client-key": CLIENT_KEY,
      ...(authHeaders ?? {}),
    },
    cache: "no-store",
  });
  if (!resp.ok) {
    throw new Error(`recent jobs failed ${resp.status}`);
  }
  const data = await resp.json();
  const rows = Array.isArray(data?.jobs) ? data.jobs : [];
  return rows.map((j: unknown) => RecentJobRow.parse(j));
}

const QueueStats = z.object({
  queue_depth: z.number(),
  jobs_running: z.number(),
  jobs_queued: z.number(), // same as queue_depth in our API, but keep both
});
export type QueueStatsT = z.infer<typeof QueueStats>;

export async function getQueueStats(authHeaders?: AuthHeaders): Promise<QueueStatsT> {
  const url = `${EDGE}/v1/queue/stats`;
  const resp = await fetch(url, { 
    headers: {
      "x-client-key": CLIENT_KEY,
      ...(authHeaders ?? {}),
    },
    cache: "no-store" 
  });
  if (!resp.ok) throw new Error(`queue stats ${resp.status}`);
  return QueueStats.parse(await resp.json());
}

// Legacy exports for backward compatibility
export type EnqueueRespT = EnqueueResponse;
export type JobStatusRespT = JobStatusResponse;
export const enqueueGenerate = enqueueJob;
export const getJobStatus = getJob;
export const listRecent = getRecentJobs;
