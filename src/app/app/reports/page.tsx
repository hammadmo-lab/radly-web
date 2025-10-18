'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJob } from '@/lib/jobs';
import type { RecentJobRow } from '@/lib/jobs';
import { createSupabaseBrowser } from "@/utils/supabase/browser";
import { useAuthToken } from '@/hooks/useAuthToken';
import { useJobStatusPolling } from "@/hooks/useSafePolling";

// Interface for localStorage job format
interface LocalStorageJob {
  job_id: string;
  status: string;
  template_id?: string;
  title?: string;
  created_at?: number;
}

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  const router = useRouter();
  const { userId } = useAuthToken();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RecentJobRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pollingFailures, setPollingFailures] = useState(0);

  // Authentication guard
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      }
    });
  }, [router]);

  // Helper function to get user-specific localStorage key
  const getUserJobsKey = useCallback(() => {
    if (!userId) return null;
    return `radly_recent_jobs_local_${userId}`;
  }, [userId]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      
      // Don't load if no user ID
      if (!userId) {
        setRows([]);
        setErr(null);
        return;
      }
      
      // Get user-specific localStorage key
      const userJobsKey = getUserJobsKey();
      if (!userJobsKey) {
        setRows([]);
        setErr(null);
        return;
      }
      
      // Since /v1/jobs/recent doesn't exist, we'll use localStorage as the primary source
      // and try to get recent jobs from there
      const localJobs = JSON.parse(localStorage.getItem(userJobsKey) || '[]');
      
      if (localJobs.length > 0) {
        // Convert localStorage format to RecentJobRow format
        const formattedJobs: RecentJobRow[] = localJobs.map((job: LocalStorageJob) => ({
          job_id: job.job_id,
          status: job.status || 'queued',
          template_id: job.template_id || job.title || '—'
        }));
        setRows(formattedJobs);
        setErr(null);
      } else {
        // If no localStorage data, show empty state
        setRows([]);
        setErr(null);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load reports';
      console.warn('Failed to load reports:', message);
      setRows([]);
      setErr(null);
    } finally {
      setLoading(false);
    }
  }, [userId, getUserJobsKey]);

  // Function to update job status in localStorage
  const updateJobStatus = useCallback(async (jobId: string, newStatus: string) => {
    try {
      const userJobsKey = getUserJobsKey();
      if (!userJobsKey) return;
      
      const localJobs = JSON.parse(localStorage.getItem(userJobsKey) || '[]');
      const updatedJobs = localJobs.map((job: LocalStorageJob) => 
        job.job_id === jobId ? { ...job, status: newStatus } : job
      );
      localStorage.setItem(userJobsKey, JSON.stringify(updatedJobs));
      
      // Update the current rows state
      setRows(prevRows => 
        prevRows.map(row => 
          row.job_id === jobId ? { ...row, status: newStatus } : row
        )
      );
    } catch (error) {
      console.warn('Failed to update job status in localStorage:', error);
    }
  }, [getUserJobsKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Use safe polling for job status updates with exponential backoff
  useJobStatusPolling(async () => {
    const queuedOrRunningJobs = rows.filter(row =>
      row.status === 'queued' || row.status === 'running'
    );

    if (queuedOrRunningJobs.length > 0) {
      let hasFailures = false;
      for (const job of queuedOrRunningJobs) {
        try {
          const jobStatus = await getJob(job.job_id);
          if (jobStatus.status !== job.status) {
            updateJobStatus(job.job_id, jobStatus.status);
          }
          // Reset failure counter on successful fetch
          setPollingFailures(0);
        } catch (error) {
          hasFailures = true;
          console.debug('Failed to fetch job status:', error);
        }
      }

      // Increment failure counter if any job fetch failed
      if (hasFailures) {
        setPollingFailures(prev => prev + 1);
      }
    }
  }, { immediate: false });

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your recent jobs…
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 text-red-600">
        {err}
        <div className="mt-3">
          <Button variant="outline" onClick={load}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No reports yet</p>
          <p className="text-sm">Generate your first report to see it here</p>
        </div>
        <Button onClick={() => router.push('/app/templates')}>
          Go to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Your Recent Reports</h1>
        <Button variant="outline" onClick={load} size="sm">
          Refresh
        </Button>
      </div>

      {/* Warning banner for polling failures */}
      {pollingFailures >= 3 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-0.5">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Status Updates Delayed</h3>
              <p className="text-sm text-yellow-700">
                We&apos;re having trouble fetching the latest job status. Your reports are still processing, but the status shown may be outdated. Try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.job_id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{r.template_id ?? 'Untitled Report'}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Status: <span className={`font-medium ${
                  r.status === 'done' ? 'text-green-600' : 
                  r.status === 'running' ? 'text-blue-600' : 
                  r.status === 'error' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {r.status === 'done' ? 'Completed' : 
                   r.status === 'running' ? 'Generating' : 
                   r.status === 'error' ? 'Failed' : 
                   'Queued'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Job ID: {r.job_id}</div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/app/report/${r.job_id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Eye className="h-4 w-4" />
                View Report
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
