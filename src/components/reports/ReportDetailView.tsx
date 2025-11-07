'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { GenerateLoading } from '@/components/GenerateLoading';
import ReportRenderer from '@/components/ReportRenderer';
import { FormattingProfileSelector } from '@/components/formatting/FormattingProfileSelector';
import { ReportMetadataSidebar } from '@/components/reports/ReportMetadataSidebar';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { useSafeClickHandler } from '@/hooks/useButtonResponsiveness';
import { useJobStatusPolling, useQueueStatsPolling } from '@/hooks/useSafePolling';
import { useSubscriptionTier } from '@/hooks/useSubscription';
import { exportReportDocx } from '@/lib/api';
import { getJob, getQueueStats, JobStatusResponse } from '@/lib/jobs';
import {
  JobResult,
  JobResultSchema,
  Patient,
  Signature,
  StrictReport,
} from '@/types/report';

type ReportDetailViewProps = {
  jobId?: string | null;
};

export default function ReportDetailView({ jobId }: ReportDetailViewProps) {
  const router = useRouter();
  const normalizedJobId = jobId?.trim() ?? '';
  const hasJobId = normalizedJobId.length > 0;

  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [running, setRunning] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormattingProfile, setSelectedFormattingProfile] = useState<string | null>(
    null,
  );

  const { user } = useAuth();
  const userTier = useSubscriptionTier();

  const startedAtMs = useRef<number | null>(null);

  useEffect(() => {
    setJobStatus(null);
    setErr(null);
    setQueueDepth(null);
    setRunning(null);
    setIsExporting(false);
    setSelectedFormattingProfile(null);
    startedAtMs.current = null;
  }, [normalizedJobId]);

  useJobStatusPolling(
    async () => {
      if (!hasJobId) return;

      try {
        const status = await getJob(normalizedJobId);
        setJobStatus(status);

        if (status.status === 'running' && !startedAtMs.current) {
          startedAtMs.current = Date.now();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch job status';
        setErr(errorMessage);

        if (errorMessage.includes('401')) {
          router.push('/login');
        }
      }
    },
    { immediate: hasJobId }
  );

  useQueueStatsPolling(
    async () => {
      if (!hasJobId) return;

      try {
        const stats = await getQueueStats();
        setQueueDepth(stats.queue_depth);
        setRunning(stats.jobs_running);
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          router.push('/login');
        }
      }
    },
    { immediate: hasJobId }
  );

  const handleExportDocx = useSafeClickHandler(async () => {
    if (!jobStatus?.result) return;

    setIsExporting(true);
    try {
      const parsed = JobResultSchema.parse(jobStatus.result);
      const resultReport: StrictReport = parsed.report;
      const resultPatient: Patient = parsed.patient ?? {};
      const resultSignature: Signature | undefined = parsed.signature;

      const hasPatientData = Boolean(
        resultPatient &&
          (resultPatient.name ||
            resultPatient.age !== undefined ||
            resultPatient.sex ||
            resultPatient.mrn ||
            resultPatient.dob ||
            resultPatient.history),
      );

      const filename = resultReport.title
        ? `${resultReport.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.docx`
        : 'radiology_report.docx';

      const exportResult = await exportReportDocx(
        resultReport,
        resultPatient,
        resultSignature,
        hasPatientData,
        filename,
        selectedFormattingProfile,
        user?.id,
      );

      const downloadUrl = exportResult.public_url || exportResult.url;

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

  if (!hasJobId) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-base font-medium text-muted-foreground">
          No report selected.
        </p>
        <Button onClick={() => router.push('/app/reports')}>Back to Reports</Button>
      </div>
    );
  }

  if (err || jobStatus?.status === 'error') {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-red-600 font-medium">Report generation failed.</p>
        <p className="text-sm text-muted-foreground">
          {err ?? jobStatus?.error ?? 'Unknown error'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push('/app/templates')}>Back to Templates</Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!jobStatus || jobStatus.status !== 'done') {
    const jobsAhead =
      queueDepth != null && running != null ? Math.max(0, queueDepth - running) : null;

    const estimatedTime =
      jobsAhead != null && jobsAhead > 0 ? `${Math.ceil(jobsAhead * 2)} min` : null;

    return (
      <GenerateLoading
        jobId={normalizedJobId}
        queuePosition={jobsAhead}
        estimatedTime={estimatedTime}
        jobStatus={jobStatus}
      />
    );
  }

  const result = jobStatus.result;

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-red-600 font-medium">Report generation failed.</p>
        <p className="text-sm text-muted-foreground">No result data available</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push('/app/templates')}>Back to Templates</Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
          <Button onClick={() => router.push('/app/templates')}>Back to Templates</Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const resultReport: StrictReport = parsed.report;
  const resultPatient: Patient = parsed.patient ?? {};
  const resultSignature: Signature | undefined = parsed.signature;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls - Full width */}
        <div className="mb-6 space-y-4">
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

        {/* Content Grid - Report + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-6">
          {/* Report - Left column */}
          <div>
            <ReportRenderer report={resultReport} patient={resultPatient} signature={resultSignature} />
          </div>

          {/* Metadata Sidebar - Right column, hidden on mobile */}
          <aside className="hidden lg:block">
            <ReportMetadataSidebar jobStatus={jobStatus} />
          </aside>
        </div>
      </div>
    </div>
  );
}

