'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Disable automatic redirect URL validation
        // This allows redirectTo to work with any domain in the allowed list
        flowType: 'pkce',
        // Don't auto-detect redirect
        detectSessionInUrl: true,
        // Allow custom redirect URLs
        persistSession: true,
      },
    }
  )
}
