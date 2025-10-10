/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/jobs.ts
import { z } from "zod";
import { createClient } from "@/lib/supabase";

const EDGE = process.env.NEXT_PUBLIC_EDGE_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_CLIENT_KEY!;

async function bearerHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const access_token = data.session?.access_token;
  if (!access_token) throw new Error("Not authenticated");
  return {
    "Content-Type": "application/json",
    "x-client-key": CLIENT_KEY,
    "Authorization": `Bearer ${access_token}`,
  };
}

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

export async function enqueueGenerate(body: any): Promise<{ job_id: string }> {
  const r = await fetch(`${EDGE}/v1/generate/async`, {
    method: "POST",
    headers: await bearerHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`enqueue failed ${r.status}`);
  return r.json();
}

export async function getJobStatus(jobId: string) {
  const r = await fetch(`${EDGE}/v1/jobs/${jobId}`, {
    headers: await bearerHeaders(),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`job status ${r.status}`);
  return r.json();
}

export async function getRecentJobs(limit = 50) {
  const r = await fetch(`${EDGE}/v1/jobs/recent?limit=${limit}`, {
    headers: await bearerHeaders(),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`recent ${r.status}`);
  return r.json();
}

const QueueStats = z.object({
  queue_depth: z.number(),
  jobs_running: z.number(),
  jobs_queued: z.number(), // same as queue_depth in our API, but keep both
});
export type QueueStatsT = z.infer<typeof QueueStats>;

export async function getQueueStats(): Promise<QueueStatsT> {
  const r = await fetch(`${EDGE}/v1/queue/stats`, { 
    headers: await bearerHeaders(), 
    cache: "no-store" 
  });
  if (!r.ok) throw new Error(`queue stats ${r.status}`);
  return QueueStats.parse(await r.json());
}
