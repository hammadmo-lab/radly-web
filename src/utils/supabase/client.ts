'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    // attempt localStorage fallback (same format supabase uses)
    try {
      const key = `sb-${new URL(SUPABASE_URL).host.split('.')[0]}-auth-token`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.currentSession?.access_token ?? null;
    } catch {
      return null;
    }
  }
}