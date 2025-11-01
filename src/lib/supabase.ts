import { createBrowserSupabase } from './supabase/client'

// Legacy function for backward compatibility
export function getSupabaseClient() {
  return createBrowserSupabase()
}