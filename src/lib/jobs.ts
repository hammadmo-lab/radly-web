/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/jobs.ts
import { z } from "zod";

const EDGE = process.env.NEXT_PUBLIC_EDGE_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_CLIENT_KEY!;

const headers: HeadersInit = {
  "Content-Type": "application/json",
  "x-client-key": CLIENT_KEY,
};

export const EnqueueResp = z.object({
  job_id: z.string(),
  status: z.enum(["queued", "running", "done", "error"]).optional(),
});
export type EnqueueRespT = z.infer<typeof EnqueueResp>;

export const JobStatusResp = z.object({
  job_id: z.string(),
  status: z.enum(["queued", "running", "done", "error"]),
  result: z.any().optional(), // backend returns GenerateResponse shape
  error: z.string().optional(),
});
export type JobStatusRespT = z.infer<typeof JobStatusResp>;

export async function enqueueGenerate(payload: unknown) {
  const r = await fetch(`${EDGE}/v1/generate/async`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`enqueue failed: ${r.status}`);
  const json = await r.json();
  return EnqueueResp.parse(json);
}

export async function getJobStatus(jobId: string): Promise<JobStatusRespT> {
  const r = await fetch(`${EDGE}/v1/jobs/${jobId}`, { headers, cache: "no-store" });
  if (!r.ok) throw new Error(`status ${r.status}`);
  return JobStatusResp.parse(await r.json());
}

export async function listRecent(limit = 50) {
  const r = await fetch(`${EDGE}/v1/jobs/recent?limit=${limit}`, { headers, cache: "no-store" });
  if (!r.ok) throw new Error(`recent ${r.status}`);
  return (await r.json()) as { jobs: any[]; count: number };
}

const QueueStats = z.object({
  queue_depth: z.number(),
  jobs_running: z.number(),
  jobs_queued: z.number(), // same as queue_depth in our API, but keep both
});
export type QueueStatsT = z.infer<typeof QueueStats>;

export async function getQueueStats(): Promise<QueueStatsT> {
  const r = await fetch(`${EDGE}/v1/queue/stats`, { headers, cache: "no-store" });
  if (!r.ok) throw new Error(`queue stats ${r.status}`);
  return QueueStats.parse(await r.json());
}
