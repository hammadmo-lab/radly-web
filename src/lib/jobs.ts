// src/lib/jobs.ts
"use client";

import { apiFetch } from "./api";

export type RecentJobRow = {
  job_id: string;
  status: string;
  template_id?: string | null;
};

export async function enqueueJob(payload: {
  template_id: string;
  report: Record<string, unknown>;
  patient: Record<string, unknown>;
}) {
  const res = await apiFetch("/generate/async", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<{ status: string; job_id: string }>;
}

export async function getRecentJobs(limit = 50) {
  const res = await apiFetch(`/jobs/recent?limit=${limit}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return (await res.json()) as RecentJobRow[];
}

export async function getJob(jobId: string) {
  const res = await apiFetch(`/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getQueueStats() {
  const res = await apiFetch('/queue/stats');
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// Type exports for compatibility
export type JobStatusResponse = {
  job_id: string;
  status: string;
  result?: Record<string, unknown>;
  error?: string;
};