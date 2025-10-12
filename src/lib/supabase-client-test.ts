/**
 * Supabase client wrapper with test mode support
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { isTestMode, getTestSession } from './test-mode'

/**
 * Get Supabase client with test mode support
 */
export function getSupabaseClient() {
  const client = createClientComponentClient()

  // If in test mode, override auth methods
  if (isTestMode()) {
    return {
      ...client,
      auth: {
        ...client.auth,
        getSession: async () => ({
          data: { session: getTestSession() },
          error: null,
        }),
        getUser: async () => ({
          data: { user: getTestSession()?.user || null },
          error: null,
        }),
        signOut: async () => ({
          error: null,
        }),
      },
    }
  }

  return client
}
