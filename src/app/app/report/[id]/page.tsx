"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJob, getQueueStats, JobStatusResponse } from "@/lib/jobs";
import { JobResultSchema, StrictReport, Patient, Signature } from "@/types/report";
import ReportRenderer from "@/components/ReportRenderer";
import { GenerateLoading } from "@/components/GenerateLoading";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { exportReportDocx } from "@/lib/api";
import { toast } from "sonner";
import { useSafeInterval, useSafeClickHandler } from "@/hooks/useButtonResponsiveness";

export const dynamic = 'force-dynamic';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [running, setRunning] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const startedAtMs = useRef<number | null>(null);

  // Safe interval for status updates
  useSafeInterval(async () => {
    try {
      const s = await getJob(id);
      setJobStatus(s);

      if (s.status === "running" && !startedAtMs.current) {
        startedAtMs.current = Date.now();
      }

      // Show completion screen for 2 seconds when job is done
      if (s.status === "done" && !showCompletion) {
        setShowCompletion(true);
        setTimeout(() => {
          setShowCompletion(false);
        }, 2000);
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
  }, 2000, { immediate: true });

  // Safe interval for stats updates
  useSafeInterval(async () => {
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
  }, 4000, { immediate: true });


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
  });

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
  if (!jobStatus || jobStatus.status !== "done" || showCompletion) {
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
  const result = jobStatus.result!;
  
  // Parse & type the payload
  const parsed = JobResultSchema.parse(result);
  const resultReport: StrictReport = parsed.report;
  const resultPatient: Patient = parsed.patient ?? {};
  const resultSignature: Signature | undefined = parsed.signature;
  
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
      
      <ReportRenderer 
        report={resultReport} 
        patient={resultPatient} 
        signature={resultSignature}
      />
    </div>
  );
}
