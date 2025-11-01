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
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { triggerHaptic } from '@/utils/haptics';

// Interface for localStorage job format
interface LocalStorageJob {
  job_id: string;
  status: string;
  template_id?: string;
  title?: string;
  created_at?: number;
}

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, { label: string; badgeClass: string }> = {
  done: {
    label: 'Completed',
    badgeClass: 'bg-[rgba(63,191,140,0.18)] border border-[rgba(63,191,140,0.32)] text-[#C8F3E2]',
  },
  running: {
    label: 'Generating',
    badgeClass: 'bg-[rgba(75,142,255,0.16)] border border-[rgba(75,142,255,0.35)] text-[#D7E3FF]',
  },
  queued: {
    label: 'Queued',
    badgeClass: 'bg-[rgba(248,183,77,0.16)] border border-[rgba(248,183,77,0.35)] text-[#FBE3B5]',
  },
  error: {
    label: 'Failed',
    badgeClass: 'bg-[rgba(255,107,107,0.18)] border border-[rgba(255,107,107,0.28)] text-[#FFD1D1]',
  },
}

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

  const handleRefresh = useCallback(async () => {
    triggerHaptic('light');
    await load();
    triggerHaptic('success');
  }, [load]);

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
    <PullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div className="neon-shell space-y-6 p-5 sm:p-8 md:p-10">
        <Breadcrumb items={[{ label: 'Reports' }]} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">Your Recent Reports</h1>
            <p className="text-sm text-[rgba(207,207,207,0.65)] mt-1">
              Track generated studies, monitor statuses, and jump back into results instantly.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-[#4B8EFF] border-[#4B8EFF]/40 hover:bg-[rgba(75,142,255,0.12)]"
            onClick={() => {
              triggerHaptic('light');
              load();
            }}
            aria-label="Refresh reports list"
          >
            Refresh
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(207,207,207,0.5)]" aria-hidden="true" />
            <Input
              placeholder="Search by job ID, template, or status..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 bg-[rgba(18,22,36,0.8)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgba(207,207,207,0.45)] focus-visible:ring-[#4B8EFF]"
              aria-label="Search reports"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'status') => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[200px] bg-[rgba(18,22,36,0.8)] border border-[rgba(255,255,255,0.08)] text-white" aria-label="Sort reports">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-[rgba(10,12,20,0.95)] border border-[rgba(255,255,255,0.08)] text-white">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {searchQuery && (
          <div className="text-sm text-[rgba(207,207,207,0.6)]">
            Found {filteredAndSortedRows.length} {filteredAndSortedRows.length === 1 ? 'report' : 'reports'}
          </div>
        )}

        {pollingFailures >= 3 && (
          <div className="aurora-card border border-[rgba(248,183,77,0.28)] bg-[rgba(54,42,22,0.65)] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#F8B74D]">⚠️</div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-white">Status updates delayed</h3>
                <p className="text-sm text-[rgba(248,183,77,0.85)]">
                  We&apos;re having trouble fetching the latest job status. Reports are still processing; try refreshing to sync again.
                </p>
              </div>
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {paginatedRows.map((r) => {
            const statusStyle = STATUS_STYLES[r.status] ?? STATUS_STYLES.queued
            return (
              <li
                key={r.job_id}
                className="aurora-card border border-[rgba(255,255,255,0.05)] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(75,142,255,0.35)] hover:shadow-[0_18px_42px_rgba(20,28,45,0.55)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-white tracking-tight">
                        {(r.template_id ?? 'Untitled Report').replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyle.badgeClass}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="text-xs text-[rgba(207,207,207,0.55)]">
                      <span className="uppercase tracking-[0.28em] text-[rgba(207,207,207,0.4)] mr-2">Job ID</span>
                      <span className="font-mono text-[rgba(207,207,207,0.75)] truncate block sm:inline">{r.job_id}</span>
                    </div>
                  </div>
                  <Link
                    href={`/app/report?id=${r.job_id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_100%)] text-white shadow-[0_10px_24px_rgba(75,142,255,0.35)] hover:shadow-[0_16px_28px_rgba(75,142,255,0.45)] transition-all touch-target"
                    onClick={() => triggerHaptic('light')}
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Report</span>
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-[rgba(255,255,255,0.06)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[rgba(207,207,207,0.6)]">
              Page {currentPage} of {totalPages} ({filteredAndSortedRows.length} total {filteredAndSortedRows.length === 1 ? 'report' : 'reports'})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-[rgba(207,207,207,0.8)] border-[rgba(255,255,255,0.12)] hover:text-white"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-[rgba(207,207,207,0.8)] border-[rgba(255,255,255,0.12)] hover:text-white"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
