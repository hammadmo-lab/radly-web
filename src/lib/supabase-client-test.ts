/**
 * Supabase client wrapper with test mode support
 */
import { createBrowserClient } from '@supabase/ssr'
import { isTestMode, getTestSession } from './test-mode'

/**
 * Get Supabase client with test mode support
 */
export function getSupabaseClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // If in test mode, override auth methods
  if (isTestMode()) {
    const testSession = getTestSession()
    return {
      ...client,
      auth: {
        ...client.auth,
        getSession: async () => ({
          data: { session: testSession },
          error: null,
        }),
        getUser: async () => ({
          data: { user: testSession?.user || null },
          error: null,
        }),
        signOut: async () => ({
          error: null,
        }),
        onAuthStateChange: (callback: any) => {
          // Immediately call the callback with the test session
          callback('SIGNED_IN', testSession)
          return {
            data: { subscription: { unsubscribe: () => {} } }
          }
        },
      },
    }
  }

  return client
}
