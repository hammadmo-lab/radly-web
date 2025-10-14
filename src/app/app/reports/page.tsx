'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJob } from '@/lib/jobs';
import { getRecentReportsClient, type RecentReportRow } from '@/lib/reports';
import { createSupabaseBrowser } from "@/utils/supabase/browser";

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
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RecentReportRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Authentication guard
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      }
    });
  }, [router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const reports = await getRecentReportsClient(50);
      setRows(reports);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load reports';
      
      // If Supabase reports table doesn't exist or is empty, fallback to localStorage
      if (message.includes('404') || /reports/i.test(message)) {
        try {
          // Fallback to localStorage for recent jobs
          const localJobs = JSON.parse(localStorage.getItem('radly_recent_jobs_local') || '[]');
          // Convert localStorage format to RecentReportRow format
          const formattedJobs: RecentReportRow[] = localJobs.map((job: LocalStorageJob) => ({
            job_id: job.job_id,
            status: (job.status || 'queued') as RecentReportRow['status'],
            template_id: job.template_id || job.title || '—',
            doc_url: null,
            created_at: job.created_at ? new Date(job.created_at).toISOString() : new Date().toISOString()
          }));
          setRows(formattedJobs);
          setErr(null);
        } catch (localError) {
          console.warn('Failed to load from localStorage:', localError);
          setRows([]);
          setErr(null);
        }
      } else {
        setErr(message);
      }
      
      if (message.toLowerCase().includes('401')) {
        router.push('/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Function to update job status in localStorage
  const updateJobStatus = useCallback(async (jobId: string, newStatus: string) => {
    try {
      const localJobs = JSON.parse(localStorage.getItem('radly_recent_jobs_local') || '[]');
      const updatedJobs = localJobs.map((job: LocalStorageJob) => 
        job.job_id === jobId ? { ...job, status: newStatus } : job
      );
      localStorage.setItem('radly_recent_jobs_local', JSON.stringify(updatedJobs));
      
      // Update the current rows state
      setRows(prevRows => 
        prevRows.map(row => 
          row.job_id === jobId ? { ...row, status: newStatus as RecentReportRow['status'] } : row
        )
      );
    } catch (error) {
      console.warn('Failed to update job status in localStorage:', error);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Periodically update status of queued jobs
  useEffect(() => {
    const interval = setInterval(async () => {
      const queuedJobs = rows.filter(row => row.status === 'queued');
      
      if (queuedJobs.length > 0) {
        for (const job of queuedJobs) {
          try {
            const jobStatus = await getJob(job.job_id);
            if (jobStatus.status !== job.status) {
              updateJobStatus(job.job_id, jobStatus.status);
            }
          } catch (error) {
            // Ignore individual job fetch errors
            console.debug('Failed to fetch job status:', error);
          }
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [rows, updateJobStatus]);

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
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.job_id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{r.template_id ?? 'Untitled Report'}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Status: <span className={`font-medium ${
                  r.status === 'done' ? 'text-green-600' : 
                  r.status === 'error' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {r.status === 'done' ? 'Completed' : 
                   r.status === 'error' ? 'Failed' : 
                   'Queued'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Job ID: {r.job_id}
                {r.created_at && (
                  <span className="ml-2">
                    • Created: {new Date(r.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
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
