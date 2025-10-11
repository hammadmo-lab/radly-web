// lib/reports.ts
import { createClient as createServerSupabase } from '@/utils/supabase/server';

export type RecentReportRow = {
  job_id: string;         // maps to reports.id
  template_id: string;    // maps to reports.title (for UI compatibility)
  status: 'queued' | 'done' | 'error';
  doc_url: string | null;
  created_at: string;
};

/**
 * Server-side fetch of the authenticated user's reports.
 * Returns an empty array if table is missing or there are no rows.
 * Throws only on unexpected errors.
 */
export async function getRecentReports(limit = 50): Promise<RecentReportRow[]> {
  const supabase = createServerSupabase();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw new Error(`Auth error: ${authErr.message}`);
  if (!auth?.user) {
    const e: any = new Error('401 unauthenticated');
    e.status = 401;
    throw e;
  }

  const { data, error, status } = await supabase
    .from('reports')
    .select('id, title, status, doc_url, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  // If the table doesn't exist yet, treat as empty.
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
