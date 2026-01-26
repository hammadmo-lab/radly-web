'use client';

import { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { GenerateLoading } from '@/components/GenerateLoading';
import { EditableReportRenderer } from '@/components/reports/EditableReportRenderer';
import { EditHintBanner } from '@/components/reports/EditHintBanner';
import { FormattingProfileSelector } from '@/components/formatting/FormattingProfileSelector';
import { ReportMetadataSidebar } from '@/components/reports/ReportMetadataSidebar';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { useSafeClickHandler } from '@/hooks/useButtonResponsiveness';
import { useJobStatusPolling, useQueueStatsPolling } from '@/hooks/useSafePolling';
import { useSubscriptionTier } from '@/hooks/useSubscription';
import { useReportEdit } from '@/hooks/useReportEdit';
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

  useLayoutEffect(() => {
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

  // Parse report for edit hook
  const parsedResult = useMemo(() => {
    if (!jobStatus?.result) return null;
    try {
      return JobResultSchema.parse(jobStatus.result);
    } catch {
      return null;
    }
  }, [jobStatus?.result]);

  const resultReport: StrictReport = parsedResult?.report ?? {
    title: '',
    technique: '',
    findings: '',
    impression: '',
    recommendations: ''
  };

  // Initialize edit hook with original report content
  const editHook = useReportEdit({
    jobId: normalizedJobId,
    original: {
      findings: resultReport.findings || '',
      impression: resultReport.impression || '',
      recommendations: resultReport.recommendations || '',
    },
    autoSaveDelay: 2000,
    onSaveSuccess: (response) => {
      if (response.edited_fields.length > 0) {
        toast.success(`Saved ${response.edited_fields.length} field(s)`);
      }
    },
    onSaveError: (error) => {
      toast.error(error.message);
    },
  });

  const handleExportDocx = useSafeClickHandler(async () => {
    if (!jobStatus?.result) return;

    setIsExporting(true);
    try {
      const parsed = JobResultSchema.parse(jobStatus.result);

      // Use edited content if available
      const exportReport: StrictReport = {
        title: parsed.report?.title || '',
        technique: parsed.report?.technique || '',
        findings: editHook.editState.findings || parsed.report?.findings || '',
        impression: editHook.editState.impression || parsed.report?.impression || '',
        recommendations: editHook.editState.recommendations || parsed.report?.recommendations || '',
      };

      const resultPatient: Patient = parsed.patient ?? {
        name: undefined,
        mrn: undefined,
        age: undefined,
        dob: undefined,
        sex: undefined,
        history: undefined
      };
      const resultSignature: Signature | undefined = parsed.signature;

      const filename = exportReport.title
        ? `${exportReport.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.docx`
        : 'radiology_report.docx';

      const exportResult = await exportReportDocx(
        exportReport,
        resultPatient,
        resultSignature,
        true, // Always include identifiers
        filename,
        selectedFormattingProfile,
        user?.id,
        normalizedJobId, // Include job_id so backend can look up edited versions
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

  const handleManualSave = useSafeClickHandler(async () => {
    await editHook.save();
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

  if (!parsedResult) {
    console.error('Failed to parse job result');
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

  const resultPatient: Patient = parsedResult.patient ?? {
    name: undefined,
    mrn: undefined,
    age: undefined,
    dob: undefined,
    sex: undefined,
    history: undefined
  };
  const resultSignature: Signature | undefined = parsedResult.signature;

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
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Manual Save Button - only show when dirty */}
              {editHook.isDirty && (
                <Button
                  onClick={handleManualSave}
                  disabled={editHook.saveStatus === 'saving' || !editHook.isValid}
                  variant="outline"
                  className="flex items-center gap-2"
                  aria-label="Save changes"
                >
                  {editHook.saveStatus === 'saving' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              )}
              <Button
                onClick={handleExportDocx}
                disabled={isExporting}
                variant="outline"
                className="flex items-center gap-2 flex-1 sm:flex-initial"
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
        </div>

        {/* Edit Hint Banner - shows once for new users */}
        <EditHintBanner className="mb-6" />

        {/* Content Grid - Report + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-6">
          {/* Report - Left column with editing */}
          <div>
            <EditableReportRenderer
              report={resultReport}
              patient={resultPatient}
              signature={resultSignature}
              isEditing={true}
              editState={editHook.editState}
              onFieldChange={editHook.updateField}
              saveStatus={editHook.saveStatus}
              lastSavedAt={editHook.lastSavedAt}
              error={editHook.error}
              isOverLimit={editHook.isOverLimit}
              isSaving={editHook.saveStatus === 'saving'}
            />
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
