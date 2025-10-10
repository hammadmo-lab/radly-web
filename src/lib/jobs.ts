import { z } from "zod";
import { apiFetch } from "@/lib/api";

type JobStatus = "queued" | "running" | "done" | "error";

export type RecentJobRow = {
  job_id: string;
  template_id: string;
  created_at: string;
  status: JobStatus;
  title?: string | null;
};

// List recent jobs for THIS user only
export async function getRecentJobs(limit = 25): Promise<RecentJobRow[]> {
  try {
    const res = await apiFetch(`/v1/jobs/recent?limit=${limit}`);
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
  } catch (error) {
    // If unauthenticated, return empty array
    if (error instanceof Error && error.message === "unauthenticated") {
      return [];
    }
    // For other errors, re-throw
    throw error;
  }
}

// Enqueue a job owned by THIS user
export async function enqueueJob(payload: Record<string, unknown>) {
  const res = await apiFetch('/v1/jobs/enqueue', {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Get job status for THIS user only
export async function getJob(jobId: string) {
  const res = await apiFetch(`/v1/jobs/${jobId}`);
  return res.json();
}

// Get queue stats (user-scoped)
export async function getQueueStats() {
  const res = await apiFetch('/v1/queue/stats');
  return res.json();
}

// Type exports for compatibility
export type JobStatusResponse = {
  job_id: string;
  status: JobStatus;
  result?: Record<string, unknown>;
  error?: string;
};