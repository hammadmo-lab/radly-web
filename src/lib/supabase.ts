import { createBrowserSupabase } from './supabase/client'

// Export both names for backward compatibility
export const getSupabaseBrowserClient = createBrowserSupabase;

// Legacy function for backward compatibility
export function getSupabaseClient() {
  return createBrowserSupabase()
}