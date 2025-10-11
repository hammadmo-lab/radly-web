// lib/reports.ts
import { createClient as createBrowserSupabase } from '@/utils/supabase/client';

export type RecentReportRow = {
  job_id: string;
  template_id: string;
  status: 'queued' | 'done' | 'error';
  doc_url: string | null;
  created_at: string;
};

/**
 * Client-side fetch using the browser Supabase client.
 * Safe for 'use client' components. Never imports `next/headers`.
 */
export async function getRecentReportsClient(limit = 50): Promise<RecentReportRow[]> {
  const supabase = createBrowserSupabase();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw new Error(`Auth error: ${authErr.message}`);
  if (!auth?.user) {
    const e = new Error('401 unauthenticated') as Error & { status: number };
    e.status = 401;
    throw e;
  }

  const { data, error, status } = await supabase
    .from('reports')
    .select('id, title, status, doc_url, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status === 404) return [];

  if (error) {
    throw new Error(`Failed to load reports: ${error.message}`);
  }

  return (data ?? []).map((r) => ({
    job_id: r.id,
    template_id: r.title ?? '—',
    status: (r.status ?? 'queued') as RecentReportRow['status'],
    doc_url: r.doc_url ?? null,
    created_at: r.created_at,
  }));
}
