'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { jobs } from '@/lib/jobs';
import type { RecentJobRow } from '@/types/jobs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [rows, setRows] = useState<RecentJobRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
   setErrorMsg(null);
    const { data, error } = await jobs.recent(50);
    if (error) {
      setErrorMsg(error);
      setRows([]);
      setLoading(false);
      return;
    }
    const list = (data?.jobs ?? []) as RecentJobRow[];
    setRows(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    // initial load
    load();
    // periodic refresh every 20s
    const id = window.setInterval(load, 20000);
    timers.current.push(id);
    return () => {
      const toClear = [...timers.current];
      toClear.forEach(clearInterval);
      timers.current = [];
    };
  }, [load]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Recent Reports</h1>
        <Button onClick={load} disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Refreshing…</> : 'Refresh'}
        </Button>
      </div>
      {errorMsg && <p className="text-red-600 mb-3">{errorMsg}</p>}
      <div className="space-y-3">
        {rows.length === 0 && !loading && <p className="text-muted-foreground">No reports yet.</p>}
        {rows.map((r) => (
          <div key={r.job_id} className="rounded-lg border p-4 text-sm">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{r.template_id}</div>
                <div className="text-muted-foreground">Job: {r.job_id}</div>
              </div>
              <div className="text-right">
                <div className="uppercase text-xs tracking-wide">{r.status}</div>
                <div className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
