'use client';
import React, { useEffect, useState, useCallback } from 'react';
import type { RecentJobRow } from '@/lib/jobs';
import { getRecentJobs } from '@/lib/jobs';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RecentJobRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const jobs = await getRecentJobs(50);
      setRows(jobs);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load reports';
      setErr(errorMessage);
      
      // If unauthenticated, redirect to login
      if (errorMessage === 'unauthenticated') {
        router.push('/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

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
      <div className="p-6 text-muted-foreground">
        No reports yet.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Your recent jobs</h1>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.job_id} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="font-medium">{r.template_id ?? '—'}</div>
              <div className="text-sm text-muted-foreground">Status: {r.status}</div>
            </div>
            <Link href={`/app/report/${r.job_id}`} className="inline-flex items-center gap-2 text-primary">
              <Eye className="h-4 w-4" />
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
