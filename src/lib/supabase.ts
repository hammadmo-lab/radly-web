// src/lib/supabase.ts
'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/** Always return the same browser client instance. */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  _client = createClient(url, anon, {
    auth: {
      persistSession: true,
      storageKey: 'radly-auth',       // <- must be stable across pages
      detectSessionInUrl: false,      // <- we handle URL exchange manually
      flowType: 'pkce',
      autoRefreshToken: true,
    },
  });

  return _client;
}
