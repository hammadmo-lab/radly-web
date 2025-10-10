"use client";

import { createBrowserClient } from "@supabase/ssr";

export type SupabaseClient = ReturnType<typeof createBrowserClient>;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

// Legacy export for backward compatibility
export const supabase = createClient();
