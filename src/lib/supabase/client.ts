'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config'

export function createBrowserSupabase() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
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
