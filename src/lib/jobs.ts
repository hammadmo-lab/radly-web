import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const EDGE = process.env.NEXT_PUBLIC_EDGE_BASE!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_CLIENT_KEY!;

type JobStatus = "queued" | "running" | "done" | "error";

export type RecentJobRow = {
  job_id: string;
  template_id: string;
  created_at: string;
  status: JobStatus;
  title?: string | null;
};

// Helper — get current user id and JWT
async function getAuth() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id ?? null;
  const accessToken = data.session?.access_token ?? null;
  return { userId, accessToken };
}

// List recent jobs for THIS user only
export async function getRecentJobs(limit = 25): Promise<RecentJobRow[]> {
  const { userId, accessToken } = await getAuth();
  if (!userId) return []; // hard stop: no user, no data

  const res = await fetch(`${EDGE}/v1/jobs/recent?limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": CLIENT_KEY,
      "X-User-Id": userId, // quick defense; backend will also verify
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = await res.json();
  const schema = z.object({
    jobs: z.array(
      z.object({
        job_id: z.string(),
        template_id: z.string(),
        created_at: z.string(),
        status: z.enum(["queued", "running", "done", "error"]),
        title: z.string().nullable().optional(),
      })
    ).default([]),
  });

  const parsed = schema.safeParse(json);
  return parsed.success ? parsed.data.jobs : [];
}

// Enqueue a job owned by THIS user
export async function enqueueJob(payload: Record<string, unknown>) {
  const { userId, accessToken } = await getAuth();
  if (!userId) throw new Error("Not authenticated");

  const res = await fetch(`${EDGE}/v1/jobs/enqueue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": CLIENT_KEY,
      "X-User-Id": userId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ ...payload, owner_id: userId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to enqueue job: ${res.status} ${text}`);
  }
  return res.json();
}

// Get job status for THIS user only
export async function getJob(jobId: string) {
  const { userId, accessToken } = await getAuth();
  if (!userId) throw new Error("Not authenticated");

  const res = await fetch(`${EDGE}/v1/jobs/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": CLIENT_KEY,
      "X-User-Id": userId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Job fetch failed: ${res.status}`);
  }
  return res.json();
}

// Get queue stats (user-scoped)
export async function getQueueStats() {
  const { userId, accessToken } = await getAuth();
  if (!userId) throw new Error("Not authenticated");

  const res = await fetch(`${EDGE}/v1/queue/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": CLIENT_KEY,
      "X-User-Id": userId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Queue stats failed: ${res.status}`);
  }
  return res.json();
}

// Type exports for compatibility
export type JobStatusResponse = {
  job_id: string;
  status: JobStatus;
  result?: Record<string, unknown>;
  error?: string;
};