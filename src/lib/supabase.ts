'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let _sb: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') throw new Error('Supabase client is browser-only');
  if (_sb) return _sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  _sb = createSupabaseClient(url, anon, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false // we handle exchange explicitly in the callback
    }
  });
  return _sb;
}
