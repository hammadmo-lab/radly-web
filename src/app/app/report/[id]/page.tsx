"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobStatus, getQueueStats, JobStatusRespT } from "@/lib/jobs";
import ReportRenderer from "@/components/ReportRenderer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<JobStatusRespT | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [running, setRunning] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(10);

  const statusTimer = useRef<number | null>(null);
  const statsTimer = useRef<number | null>(null);
  const startedAtMs = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tickStatus() {
      try {
        const s = await getJobStatus(id);
        if (cancelled) return;
        setStatus(s);

        if (s.status === "running" && !startedAtMs.current) {
          startedAtMs.current = Date.now();
        }
        if (s.status === "done" || s.status === "error") {
          if (statusTimer.current) window.clearInterval(statusTimer.current);
          statusTimer.current = null;
        }
      } catch (e: unknown) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Failed to fetch job status");
        if (statusTimer.current) window.clearInterval(statusTimer.current);
        statusTimer.current = null;
      }
    }

    async function tickStats() {
      try {
        const qs = await getQueueStats();
        if (cancelled) return;
        setQueueDepth(qs.queue_depth);
        setRunning(qs.jobs_running);
      } catch {
        // ignore transient stats errors
      }
    }

    // kick off
    tickStatus();
    tickStats();
    statusTimer.current = window.setInterval(tickStatus, 2000);
    statsTimer.current = window.setInterval(tickStats, 4000);

    return () => {
      cancelled = true;
      if (statusTimer.current) window.clearInterval(statusTimer.current);
      if (statsTimer.current) window.clearInterval(statsTimer.current);
      statusTimer.current = null;
      statsTimer.current = null;
    };
  }, [id]);

  // Progress computation
  useEffect(() => {
    if (!status) return;

    // queued: 10% → 35%, show queue info
    if (status.status === "queued") {
      setProgress((prev) => (prev < 35 ? Math.min(35, Math.max(10, prev + 3)) : prev));
      return;
    }

    // running: ramp from 35% to 95% over ~30–60s
    if (status.status === "running") {
      const started = startedAtMs.current ?? Date.now();
      const elapsed = (Date.now() - started) / 1000; // seconds
      // ease to 95% over ~45s
      const pct = 35 + Math.min(60, elapsed) * (60 / 45); // ~+1.33%/s
      setProgress(Math.min(95, pct));
      return;
    }

    if (status.status === "done") {
      setProgress(100);
    }
    if (status.status === "error") {
      setProgress(0);
    }
  }, [status]);

  // Error UI
  if (err || status?.status === "error") {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-red-600 font-medium">Report generation failed.</p>
        <p className="text-sm text-muted-foreground">{err ?? status?.error ?? "Unknown error"}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push("/app/templates")}>Back to Templates</Button>
          <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Loading / Polling UI
  if (!status || status.status !== "done") {
    const jobsAhead =
      queueDepth != null && running != null ? Math.max(0, queueDepth - running) : null;

    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            {status?.status === "running" ? "Generating your report…" : "Queued… waiting to start"}
          </div>
        </div>
        <Progress value={progress} />
        <div className="text-xs text-muted-foreground">
          {jobsAhead != null
            ? `Queue: ~${jobsAhead} job${jobsAhead === 1 ? "" : "s"} ahead`
            : "Fetching queue status…"}
        </div>
        <div className="text-xs text-muted-foreground">
          Status: {status?.status ?? "checking"} • Job ID: {id}
        </div>
      </div>
    );
  }

  // Done → render the report
  const result = status.result!;
  return (
    <div className="py-8">
      <ReportRenderer report={result.report} patient={result.patient} />
    </div>
  );
}
