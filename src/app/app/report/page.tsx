"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getJob, getQueueStats, JobStatusResponse } from "@/lib/jobs";
import { JobResultSchema, StrictReport, Patient, Signature, JobResult } from "@/types/report";
import ReportRenderer from "@/components/ReportRenderer";
import { GenerateLoading } from "@/components/GenerateLoading";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { exportReportDocx } from "@/lib/api";
import { toast } from "sonner";
import { useSafeClickHandler } from "@/hooks/useButtonResponsiveness";
import { useJobStatusPolling, useQueueStatsPolling } from "@/hooks/useSafePolling";
import { FormattingProfileSelector } from "@/components/formatting/FormattingProfileSelector";
import { useAuth } from "@/components/auth-provider";
import { useSubscriptionTier } from "@/hooks/useSubscription";

export const dynamic = 'force-dynamic';

export default function JobDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [running, setRunning] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormattingProfile, setSelectedFormattingProfile] = useState<string | null>(null);

  const { user } = useAuth();
  const userTier = useSubscriptionTier();

  const startedAtMs = useRef<number | null>(null);

  // Redirect if no ID provided
  useEffect(() => {
    if (!id) {
      router.push('/app');
    }
  }, [id, router]);

  // Safe polling for job status updates with exponential backoff
  useJobStatusPolling(async () => {
    if (!id) return;

    try {
      const s = await getJob(id);
      setJobStatus(s);

      if (s.status === "running" && !startedAtMs.current) {
        startedAtMs.current = Date.now();
      }

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to fetch job status";
      setErr(errorMessage);

      // If unauthenticated, redirect to login
      if (errorMessage.includes('401')) {
        router.push('/login');
        return;
      }
    }
  }, { immediate: true });

  // Safe polling for queue stats updates
  useQueueStatsPolling(async () => {
    try {
      const qs = await getQueueStats();
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
  }, { immediate: true });


  // Export handler with safe click handling
  const handleExportDocx = useSafeClickHandler(async () => {
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
        filename,
        selectedFormattingProfile, // Custom formatting profile ID
        user?.id // User ID for profile lookup
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
  });

  // Show loading if no ID
  if (!id) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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

    // Format estimated time based on queue position
    const estimatedTime = jobsAhead != null && jobsAhead > 0
      ? `${Math.ceil(jobsAhead * 2)} min` // Rough estimate: 2 minutes per job
      : null;

    return (
      <GenerateLoading
        jobId={id}
        queuePosition={jobsAhead}
        estimatedTime={estimatedTime}
        jobStatus={jobStatus}
      />
    );
  }

  // Done → render the report
  const result = jobStatus.result;

  // Validate that we have a result
  if (!result) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-red-600 font-medium">Report generation failed.</p>
        <p className="text-sm text-muted-foreground">No result data available</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push("/app/templates")}>Back to Templates</Button>
          <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Parse & type the payload with error handling
  let parsed: JobResult;
  try {
    parsed = JobResultSchema.parse(result);
  } catch (error) {
    console.error('Failed to parse job result:', error);
    console.error('Raw result data:', result);
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-red-600 font-medium">Report generation failed.</p>
        <p className="text-sm text-muted-foreground">Invalid report data format</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push("/app/templates")}>Back to Templates</Button>
          <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
        </div>
      </div>
    );
  }

  const resultReport: StrictReport = parsed.report;
  const resultPatient: Patient = parsed.patient ?? {};
  const resultSignature: Signature | undefined = parsed.signature;

  return (
    <div className="py-8">
      {/* Export Options */}
      <div className="max-w-3xl mx-auto mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <FormattingProfileSelector
              value={selectedFormattingProfile}
              onChange={setSelectedFormattingProfile}
              userTier={userTier}
            />
          </div>
          <Button
            onClick={handleExportDocx}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
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
      </div>

      <ReportRenderer
        report={resultReport}
        patient={resultPatient}
        signature={resultSignature}
      />
    </div>
  );
}
