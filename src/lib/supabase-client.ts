import { createBrowserClient } from '@supabase/ssr'
import { isTestMode } from '@/lib/test-mode'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config'

/**
 * Get Supabase client with test mode support
 */
export function getSupabaseClient() {
  // Check if test mode is enabled
  if (isTestMode()) {
    console.log('🧪 Using test mode Supabase client')
    return createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    )
  }

  // Return regular client
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  )
}