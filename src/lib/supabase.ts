"use client";

import { createBrowserClient } from "@supabase/ssr";

export type SupabaseClient = ReturnType<typeof createBrowserClient>;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

// Lazy initialization to avoid SSR issues
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createClient();
  }
  return _supabase;
}

// Legacy export for backward compatibility - now lazy
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  }
});
