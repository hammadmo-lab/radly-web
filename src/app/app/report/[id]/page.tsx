"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJob, getQueueStats, JobStatusResponse } from "@/lib/jobs";
import { JobResultSchema, StrictReport, Patient, Signature } from "@/types/report";
import ReportRenderer from "@/components/ReportRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { exportReportDocx } from "@/lib/api";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [running, setRunning] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(10);
  const [isExporting, setIsExporting] = useState(false);

  const statusTimer = useRef<number | null>(null);
  const statsTimer = useRef<number | null>(null);
  const startedAtMs = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tickStatus() {
      try {
        const s = await getJob(id);
        if (cancelled) return;
        setJobStatus(s);

        if (s.status === "running" && !startedAtMs.current) {
          startedAtMs.current = Date.now();
        }
        if (s.status === "done" || s.status === "error") {
          if (statusTimer.current) window.clearInterval(statusTimer.current);
          statusTimer.current = null;
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const errorMessage = e instanceof Error ? e.message : "Failed to fetch job status";
        setErr(errorMessage);
        
        // If unauthenticated, redirect to login
        if (errorMessage.includes('401')) {
          router.push('/login');
          return;
        }
        
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
      } catch (e: unknown) {
        // If unauthenticated, redirect to login
        if (e instanceof Error && e.message.includes('401')) {
          router.push('/login');
          return;
        }
        // ignore other transient stats errors
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
  }, [id, router]);

  // Progress computation
  useEffect(() => {
    if (!jobStatus) return;

    // queued: 10% → 35%, show queue info
    if (jobStatus.status === "queued") {
      setProgress((prev) => (prev < 35 ? Math.min(35, Math.max(10, prev + 3)) : prev));
      return;
    }

    // running: ramp from 35% to 95% over ~30–60s
    if (jobStatus.status === "running") {
      const started = startedAtMs.current ?? Date.now();
      const elapsed = (Date.now() - started) / 1000; // seconds
      // ease to 95% over ~45s
      const pct = 35 + Math.min(60, elapsed) * (60 / 45); // ~+1.33%/s
      setProgress(Math.min(95, pct));
      return;
    }

    if (jobStatus.status === "done") {
      setProgress(100);
    }
    if (jobStatus.status === "error") {
      setProgress(0);
    }
  }, [jobStatus]);

  // Export handler
  const handleExportDocx = async () => {
    if (!jobStatus?.result) return;
    
    setIsExporting(true);
    try {
      const parsed = JobResultSchema.parse(jobStatus.result);
      const resultReport: StrictReport = parsed.report;
      const resultPatient: Patient = parsed.patient ?? {};
      const resultSignature: Signature | undefined = parsed.signature;
      
      // Determine if patient data should be included
      const hasPatientData = Boolean(resultPatient && (
        resultPatient.name || 
        resultPatient.age !== undefined || 
        resultPatient.sex || 
        resultPatient.mrn || 
        resultPatient.dob || 
        resultPatient.history
      ));
      
      // Generate filename
      const filename = resultReport.title 
        ? `${resultReport.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.docx`
        : 'radiology_report.docx';
      
      const exportResult = await exportReportDocx(
        resultReport,
        resultPatient,
        resultSignature, // ✅ PASS SIGNATURE TO EXPORT API
        hasPatientData, // include identifiers if patient data exists
        filename
      );
      
      // Use public_url if available, otherwise use presigned URL
      const downloadUrl = exportResult.public_url || exportResult.url;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export report';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Error UI
  if (err || jobStatus?.status === "error") {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-red-600 font-medium">Report generation failed.</p>
        <p className="text-sm text-muted-foreground">{err ?? jobStatus?.error ?? "Unknown error"}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push("/app/templates")}>Back to Templates</Button>
          <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Loading / Polling UI
  if (!jobStatus || jobStatus.status !== "done") {
    const jobsAhead =
      queueDepth != null && running != null ? Math.max(0, queueDepth - running) : null;

    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            {jobStatus?.status === "running" ? "Generating your report…" : "Queued… waiting to start"}
          </div>
        </div>
        <Progress value={progress} />
        <div className="text-xs text-muted-foreground">
          {jobsAhead != null
            ? `Queue: ~${jobsAhead} job${jobsAhead === 1 ? "" : "s"} ahead`
            : "Fetching queue status…"}
        </div>
        <div className="text-xs text-muted-foreground">
          Status: {jobStatus?.status ?? "checking"} • Job ID: {id}
        </div>
      </div>
    );
  }

  // Done → render the report
  const result = jobStatus.result!;
  
  // Parse & type the payload
  const parsed = JobResultSchema.parse(result);
  const resultReport: StrictReport = parsed.report;
  const resultPatient: Patient = parsed.patient ?? {};
  
  return (
    <div className="py-8">
      {/* Export Button */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-end">
        <Button
          onClick={handleExportDocx}
          disabled={isExporting}
          variant="outline"
          className="flex items-center gap-2"
          aria-label="Download report as DOCX"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? 'Exporting...' : 'Download DOCX'}
        </Button>
      </div>
      
      <ReportRenderer report={resultReport} patient={resultPatient} />
    </div>
  );
}
