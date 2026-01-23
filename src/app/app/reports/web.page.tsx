'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, ChevronLeft, ChevronRight, Copy, Check, Trash2, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJob, getRecentJobs } from '@/lib/jobs';
import type { RecentJobRow } from '@/lib/jobs';
import { createSupabaseBrowser } from "@/utils/supabase/browser";
import { useAuthToken } from '@/hooks/useAuthToken';
import { useJobStatusPolling } from "@/hooks/useSafePolling";
import { useReportSelection } from '@/hooks/useReportSelection';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { EnhancedEmptyState } from '@/components/shared/EnhancedEmptyState';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { BulkActionToolbar } from '@/components/reports/BulkActionToolbar';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { triggerHaptic } from '@/utils/haptics';

// Interface for localStorage job format
interface LocalStorageJob {
  job_id: string;
  status: string;
  template_id?: string;
  title?: string;
  created_at?: number;
  completed_at?: number;
}

export const dynamic = 'force-dynamic';

// Constants for cleanup
const COMPLETED_JOB_CLEANUP_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds
const REPORT_RETENTION_HOURS = 24; // 24 hours

/**
 * Cleans up old jobs from localStorage
 * - Removes jobs completed more than 5 minutes ago
 * - Removes jobs older than 24 hours regardless of status
 * - Removes orphaned jobs (404s from backend)
 */
const cleanupJobs = (jobs: LocalStorageJob[]): { cleaned: LocalStorageJob[], removedCount: number } => {
  const now = Date.now();
  const twentyFourHoursAgo = now - (REPORT_RETENTION_HOURS * 60 * 60 * 1000);
  const fiveMinutesAgo = now - COMPLETED_JOB_CLEANUP_DELAY;

  const cleaned = jobs.filter(job => {
    // Check if job is older than 24 hours
    if (job.created_at && job.created_at < twentyFourHoursAgo) {
      return false; // Remove job older than 24 hours
    }

    // Check if completed job is older than 5 minutes
    if (job.status === 'done' && job.completed_at && job.completed_at < fiveMinutesAgo) {
      return false; // Remove completed job after 5 minutes
    }

    return true; // Keep job
  });

  return {
    cleaned,
    removedCount: jobs.length - cleaned.length
  };
};

const STATUS_STYLES: Record<string, { label: string; badgeClass: string }> = {
  done: {
    label: 'Completed',
    badgeClass: 'bg-[rgba(212,180,131,0.18)] border border-[rgba(212,180,131,0.32)] text-[#C8F3E2]',
  },
  running: {
    label: 'Generating',
    badgeClass: 'bg-[rgba(245,215,145,0.16)] border border-[rgba(245,215,145,0.35)] text-[#E8DCC8]',
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

  // Pagination, search, sort, and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const itemsPerPage = 20;

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Multi-select state
  const {
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    getSelectedIds,
    getSelectedCount,
  } = useReportSelection(userId);

  // Copy to clipboard
  const { copy, isCopied } = useCopyToClipboard();

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

      let allJobs: RecentJobRow[] = [];

      // Try to fetch from backend API first (this will show reports from all devices)
      try {
        const backendJobs = await getRecentJobs(100);
        allJobs = backendJobs;
        console.log(`Loaded ${backendJobs.length} reports from server`);
      } catch (error) {
        console.warn('Failed to fetch reports from server:', error);
        // Continue with localStorage if API fails
      }

      // Also load from localStorage for optimistic updates (jobs created on this device)
      const localJobs = JSON.parse(localStorage.getItem(userJobsKey) || '[]');

      // Merge backend and local data, avoiding duplicates
      const jobMap = new Map<string, RecentJobRow>();

      // Add backend jobs first
      allJobs.forEach(job => {
        jobMap.set(job.job_id, job);
      });

      // Add/merge local jobs (these might be newer than backend)
      localJobs.forEach((job: LocalStorageJob) => {
        const existingJob = jobMap.get(job.job_id);
        if (existingJob) {
          // Update status if local job has more recent info
          if (job.status && job.status !== existingJob.status) {
            existingJob.status = job.status;
          }
        } else {
          // New job from localStorage (optimistic update)
          jobMap.set(job.job_id, {
            job_id: job.job_id,
            status: job.status || 'queued',
            template_id: job.template_id || job.title || '-'
          });
        }
      });

      // Convert to array
      const mergedJobs = Array.from(jobMap.values());

      // Validate that jobs still exist on backend - clean up orphaned jobs
      const validJobs: RecentJobRow[] = [];
      const orphanedJobs: string[] = [];

      // Check all jobs in parallel
      const validationResults = await Promise.allSettled(
        mergedJobs.map(job => getJob(job.job_id))
      );

      validationResults.forEach((result, index) => {
        const job = mergedJobs[index];
        if (result.status === 'fulfilled') {
          // Job exists on backend - keep it and update status
          validJobs.push({
            ...job,
            status: result.value.status
          });
        } else {
          // Job doesn't exist on backend (404 or other error) - remove
          const error = result.reason;
          if (error?.status === 404) {
            orphanedJobs.push(job.job_id);
          } else {
            // For other errors (network, etc.), keep the job
            validJobs.push(job);
          }
        }
      });

      // Clean up orphaned jobs from localStorage
      if (orphanedJobs.length > 0) {
        const remainingLocalJobs = localJobs.filter((job: LocalStorageJob) =>
          !orphanedJobs.includes(job.job_id)
        );
        localStorage.setItem(userJobsKey, JSON.stringify(remainingLocalJobs));
        console.log(`Removed ${orphanedJobs.length} orphaned report(s) from local storage`);
      }

      // Verify active jobs (queued/running) with backend on initial load
      const activeJobs = validJobs.filter(job =>
        job.status === 'queued' || job.status === 'running'
      );

      if (activeJobs.length > 0) {
        try {
          const verificationResults = await Promise.allSettled(
            activeJobs.map(job => getJob(job.job_id))
          );

          verificationResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              const backendStatus = result.value.status;
              const localStatus = activeJobs[index].status;
              if (backendStatus !== localStatus) {
                // Update localStorage
                const updatedLocalJobs = localJobs.map((job: LocalStorageJob) =>
                  job.job_id === activeJobs[index].job_id
                    ? { ...job, status: backendStatus, completed_at: backendStatus === 'done' ? Date.now() : job.completed_at }
                    : job
                );
                localStorage.setItem(userJobsKey, JSON.stringify(updatedLocalJobs));

                // Update valid jobs for UI
                const jobIndex = validJobs.findIndex(j => j.job_id === activeJobs[index].job_id);
                if (jobIndex !== -1) {
                  validJobs[jobIndex].status = backendStatus as 'queued' | 'running' | 'done' | 'error';
                }
              }
            }
          });
        } catch (e) {
          console.warn('Failed to verify active jobs:', e);
        }
      }

      setRows(validJobs);
      setErr(null);
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
      const updatedJobs = localJobs.map((job: LocalStorageJob) => {
        // Track completion timestamp when job transitions to 'done'
        if (job.job_id === jobId && newStatus === 'done' && !job.completed_at) {
          return { ...job, status: newStatus, completed_at: Date.now() };
        }
        return { ...job, status: newStatus };
      });

      localStorage.setItem(userJobsKey, JSON.stringify(updatedJobs));

      // Update the current rows state using functional update to avoid stale closures
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

      // Track jobs to remove (404s - no longer exist on backend)
      const jobsToRemove: string[] = [];

      let hasFailures = false;
      results.forEach((result, index) => {
        const job = queuedOrRunningJobs[index];

        if (result.status === 'fulfilled') {
          const jobStatus = result.value;
          if (jobStatus.status !== job.status) {
            updateJobStatus(job.job_id, jobStatus.status);
          }
        } else {
          // Check if it's a 404 (job no longer exists on backend)
          const error = result.reason;
          if (error?.status === 404) {
            // Job doesn't exist on backend anymore - remove from list
            jobsToRemove.push(job.job_id);
          } else {
            hasFailures = true;
            console.debug('Failed to fetch job status:', error);
          }
        }
      });

      // Remove jobs that no longer exist on backend (404s)
      if (jobsToRemove.length > 0) {
        const userJobsKey = getUserJobsKey();
        if (userJobsKey) {
          // Remove from localStorage
          const localJobs = JSON.parse(localStorage.getItem(userJobsKey) || '[]');
          const remainingJobs = localJobs.filter((job: LocalStorageJob) =>
            !jobsToRemove.includes(job.job_id)
          );

          // Apply cleanup logic to remove old and completed jobs
          const { cleaned, removedCount } = cleanupJobs(remainingJobs);

          // Log cleanup results
          if (removedCount > 0) {
            console.log(`Auto-cleaned ${removedCount} old/expired report(s)`);
          }

          localStorage.setItem(userJobsKey, JSON.stringify(cleaned));
        }

        // Remove from state
        setRows(prevRows => prevRows.filter(row => !jobsToRemove.includes(row.job_id)));
      }

      // Additionally, run cleanup on all jobs periodically to catch any completed/old jobs
      const userJobsKey = getUserJobsKey();
      if (userJobsKey && queuedOrRunningJobs.length > 0) {
        const localJobs = JSON.parse(localStorage.getItem(userJobsKey) || '[]');
        const { cleaned, removedCount } = cleanupJobs(localJobs);
        if (removedCount > 0) {
          localStorage.setItem(userJobsKey, JSON.stringify(cleaned));
          setRows(prevRows => prevRows.filter(row =>
            cleaned.some((job: LocalStorageJob) => job.job_id === row.job_id)
          ));
          console.log(`Periodic cleanup: removed ${removedCount} expired report(s)`);
        }
      }

      // Reset or increment failure counter based on results
      if (hasFailures) {
        setPollingFailures(prev => prev + 1);
      } else {
        setPollingFailures(0);
      }
    }

    // Periodically refresh from backend API to sync cross-device reports
    // This runs every polling cycle to keep data fresh
    try {
      const backendJobs = await getRecentJobs(100);
      if (backendJobs.length > 0) {
        // Merge with existing rows, preserving local optimistic updates
        const userJobsKey = getUserJobsKey();
        const localJobs = userJobsKey ? JSON.parse(localStorage.getItem(userJobsKey) || '[]') : [];

        const jobMap = new Map<string, RecentJobRow>();

        // Add backend jobs
        backendJobs.forEach(job => {
          jobMap.set(job.job_id, job);
        });

        // Merge local jobs (for optimistic updates)
        localJobs.forEach((job: LocalStorageJob) => {
          const existing = jobMap.get(job.job_id);
          if (existing) {
            // Update status if different
            if (job.status && job.status !== existing.status) {
              existing.status = job.status;
            }
          } else {
            // New local job
            jobMap.set(job.job_id, {
              job_id: job.job_id,
              status: job.status || 'queued',
              template_id: job.template_id || job.title || '-'
            });
          }
        });

        const mergedJobs = Array.from(jobMap.values());

        // Only update if there are changes
        if (mergedJobs.length !== rows.length ||
          mergedJobs.some(job => {
            const existingRow = rows.find(r => r.job_id === job.job_id);
            return !existingRow || existingRow.status !== job.status;
          })) {
          setRows(mergedJobs);
          console.log(`Synced ${mergedJobs.length} reports from server`);
        }
      }
    } catch (error) {
      console.debug('Failed to sync from server during polling:', error);
      // Silently fail - this is just a sync attempt
    }
  }, { immediate: false });

  // Filter, sort, and paginate rows
  const { filteredAndSortedRows, totalPages, paginatedRows } = useMemo(() => {
    // Filter by search query and status
    const filtered = rows.filter(row => {
      // Status filter
      if (statusFilter && row.status !== statusFilter) return false;

      // Search filter
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
  }, [rows, searchQuery, sortBy, currentPage, itemsPerPage, statusFilter]);

  const handleRefresh = useCallback(async () => {
    triggerHaptic('light');
    await load();
    triggerHaptic('success');
  }, [load]);

  const handleDeleteJob = useCallback(async () => {
    if (!jobToDelete || !userId) return;

    setIsDeleting(true);
    try {
      const userJobsKey = `radly_recent_jobs_local_${userId}`;
      const localJobs = JSON.parse(localStorage.getItem(userJobsKey) || '[]');
      const updatedJobs = localJobs.filter((job: LocalStorageJob) => job.job_id !== jobToDelete);
      localStorage.setItem(userJobsKey, JSON.stringify(updatedJobs));

      // Update rows state
      setRows(prevRows => prevRows.filter(row => row.job_id !== jobToDelete));
      triggerHaptic('success');
    } catch (error) {
      console.error('Failed to delete report:', error);
      triggerHaptic('error');
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
      setDeleteConfirmOpen(false);
    }
  }, [jobToDelete, userId]);

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
      <div className="neon-shell space-y-6 p-5 sm:p-8 md:p-10">
        <Breadcrumb items={[{ label: 'Reports' }]} />
        <EnhancedEmptyState
          icon="reports"
          title="No reports yet"
          description="Your generated reports will appear here after generation completes. Start by selecting a template and generating your first report."
          ctaText="Generate Your First Report"
          onCta={() => router.push('/app/templates')}
        />
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
            className="h-10 px-4 text-[#F5D791] border-[#F5D791]/40 hover:bg-[rgba(245,215,145,0.12)]"
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
              className="pl-9 bg-[rgba(18,22,36,0.8)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgba(207,207,207,0.45)] focus-visible:ring-[#F5D791]"
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setStatusFilter(null);
              setCurrentPage(1);
              triggerHaptic('light');
            }}
            className={`px-4 py-2 min-h-[44px] rounded-lg border transition-colors text-sm font-medium touch-manipulation active:scale-95 ${statusFilter === null
                ? 'border-[#F5D791] bg-[rgba(245,215,145,0.12)] text-[#E8DCC8]'
                : 'border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.75)] hover:border-[rgba(245,215,145,0.4)] hover:text-white'
              }`}
            aria-label="Show all reports"
          >
            All Reports
          </button>
          {Object.entries(STATUS_STYLES).map(([status, { label, badgeClass }]) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(statusFilter === status ? null : status);
                setCurrentPage(1);
                triggerHaptic('light');
              }}
              className={`px-4 py-2 min-h-[44px] rounded-lg border transition-colors text-sm font-medium touch-manipulation active:scale-95 ${statusFilter === status
                  ? badgeClass.replace('bg-', 'bg-').replace('border', 'border') + ' border-current'
                  : 'border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.85)] text-[rgba(207,207,207,0.75)] hover:border-[rgba(255,255,255,0.2)] hover:text-white'
                }`}
              aria-label={`Filter by ${label.toLowerCase()}`}
            >
              {label}
            </button>
          ))}
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

        {/* Bulk Actions Toolbar */}
        {getSelectedCount() > 0 && (
          <BulkActionToolbar
            selectedCount={getSelectedCount()}
            totalCount={filteredAndSortedRows.length}
            selectedIds={getSelectedIds()}
            onClearSelection={clearSelection}
            onSelectAll={() => {
              toggleSelectAll(filteredAndSortedRows.map(r => r.job_id));
              triggerHaptic('light');
            }}
            onCopyJobIds={() => { }}
            onBulkDelete={(failedIds) => {
              // Remove deleted reports from the list
              setRows(prevRows =>
                prevRows.filter(row => !getSelectedIds().includes(row.job_id) || failedIds.includes(row.job_id))
              );
            }}
            onBulkExport={() => { }}
          />
        )}

        <ul className="space-y-4">
          {paginatedRows.map((r) => {
            const statusStyle = STATUS_STYLES[r.status] ?? STATUS_STYLES.queued
            return (
              <li
                key={r.job_id}
                className={`aurora-card border transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 ${isSelected(r.job_id)
                    ? 'border-[rgba(75,142,255,0.5)] bg-[rgba(245,215,145,0.1)]'
                    : 'border-[rgba(255,255,255,0.05)] hover:border-[rgba(245,215,145,0.35)] hover:shadow-[0_18px_42px_rgba(20,28,45,0.55)]'
                  }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Checkbox */}
                  <button
                    onClick={() => {
                      toggleSelection(r.job_id);
                      triggerHaptic('light');
                    }}
                    className="flex-shrink-0 p-2 min-h-[44px] min-w-[44px] rounded hover:bg-[rgba(245,215,145,0.12)] transition-colors active:scale-95 flex items-center justify-center touch-manipulation"
                    aria-label={`Select report ${r.job_id}`}
                  >
                    {isSelected(r.job_id) ? (
                      <CheckCircle2 className="h-5 w-5 text-[#F5D791]" />
                    ) : (
                      <Circle className="h-5 w-5 text-[rgba(207,207,207,0.4)]" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-white tracking-tight">
                        {(r.template_id ?? 'Untitled Report').replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyle.badgeClass}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="text-xs text-[rgba(207,207,207,0.55)] space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="uppercase tracking-[0.28em] text-[rgba(207,207,207,0.4)]">Job ID</span>
                        <span className="font-mono text-[rgba(207,207,207,0.75)] truncate">{r.job_id}</span>
                        <button
                          onClick={() => {
                            copy(r.job_id);
                            triggerHaptic('light');
                          }}
                          className="p-2 min-h-[44px] min-w-[44px] rounded hover:bg-[rgba(245,215,145,0.12)] transition-colors active:scale-95 flex items-center justify-center touch-manipulation"
                          title="Copy Job ID"
                          aria-label="Copy Job ID"
                        >
                          {isCopied && jobToDelete === r.job_id ? (
                            <Check className="h-4 w-4 text-[#D4B483]" />
                          ) : (
                            <Copy className="h-4 w-4 text-[rgba(207,207,207,0.5)] hover:text-[#F5D791]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Link
                      href={`/app/report/${r.job_id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[linear-gradient(90deg,#E5C478_0%,#F5D791_100%)] text-white shadow-[0_10px_24px_rgba(245,215,145,0.35)] hover:shadow-[0_16px_28px_rgba(245,215,145,0.45)] transition-all touch-target text-sm"
                      onClick={() => triggerHaptic('light')}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => {
                        setJobToDelete(r.job_id);
                        setDeleteConfirmOpen(true);
                        triggerHaptic('light');
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.08)] text-[rgba(255,107,107,0.9)] hover:bg-[rgba(255,107,107,0.15)] transition-colors touch-target text-sm min-h-[44px]"
                      title="Delete report"
                      aria-label="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Report?"
        description="This report will be permanently removed from your list. You can still access it through the Radly archive if needed."
        confirmText="Delete Report"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteJob}
      />
    </PullToRefresh>
  );
}
