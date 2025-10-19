'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, ChevronLeft, ChevronRight, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJob } from '@/lib/jobs';
import type { RecentJobRow } from '@/lib/jobs';
import { createSupabaseBrowser } from "@/utils/supabase/browser";
import { useAuthToken } from '@/hooks/useAuthToken';
import { useJobStatusPolling } from "@/hooks/useSafePolling";
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Pagination, search, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      // Fetch all job statuses in parallel instead of sequentially
      const results = await Promise.allSettled(
        queuedOrRunningJobs.map(job => getJob(job.job_id))
      );

      let hasFailures = false;
      results.forEach((result, index) => {
        const job = queuedOrRunningJobs[index];

        if (result.status === 'fulfilled') {
          const jobStatus = result.value;
          if (jobStatus.status !== job.status) {
            updateJobStatus(job.job_id, jobStatus.status);
          }
        } else {
          hasFailures = true;
          console.debug('Failed to fetch job status:', result.reason);
        }
      });

      // Reset or increment failure counter based on results
      if (hasFailures) {
        setPollingFailures(prev => prev + 1);
      } else {
        setPollingFailures(0);
      }
    }
  }, { immediate: false });

  // Filter, sort, and paginate rows
  const { filteredAndSortedRows, totalPages, paginatedRows } = useMemo(() => {
    // Filter by search query
    const filtered = rows.filter(row => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        row.job_id.toLowerCase().includes(query) ||
        row.template_id?.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        // Assume newer job_ids are higher (if UUID-based, this won't work perfectly)
        return b.job_id.localeCompare(a.job_id);
      } else if (sortBy === 'oldest') {
        return a.job_id.localeCompare(b.job_id);
      } else if (sortBy === 'status') {
        const statusOrder = { 'running': 0, 'queued': 1, 'done': 2, 'error': 3 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
        return aOrder - bOrder;
      }
      return 0;
    });

    // Paginate
    const total = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

    return {
      filteredAndSortedRows: filtered,
      totalPages: total,
      paginatedRows: paginated,
    };
  }, [rows, searchQuery, sortBy, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className="p-6">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-32 mb-4" />

        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>

        {/* Search and sort controls skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>

        {/* Report list skeleton */}
        <ul className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            </li>
          ))}
        </ul>
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
      <div className="p-6 text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">
            <p className="text-lg font-semibold mb-2">No reports yet</p>
            <p className="text-sm max-w-md mx-auto">
              Your generated reports will appear here after generation completes. Start by selecting a template and generating your first report.
            </p>
          </div>
        </div>
        <Button onClick={() => router.push('/app/templates')} className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Your First Report
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Reports' }]} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Your Recent Reports</h1>
        <Button variant="outline" onClick={load} size="sm" aria-label="Refresh reports list">
          Refresh
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by job ID, template, or status..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-9"
            aria-label="Search reports"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'status') => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort reports">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="mb-4 text-sm text-muted-foreground">
          Found {filteredAndSortedRows.length} {filteredAndSortedRows.length === 1 ? 'report' : 'reports'}
        </div>
      )}

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
        {paginatedRows.map((r) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({filteredAndSortedRows.length} total {filteredAndSortedRows.length === 1 ? 'report' : 'reports'})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
