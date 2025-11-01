/**
 * Supabase client wrapper with test mode support
 */
import { createBrowserClient } from '@supabase/ssr'
import { Session } from '@supabase/supabase-js'
import { isTestMode, getTestSession } from './test-mode'
import { Capacitor } from '@capacitor/core'

/**
 * Get Supabase client with test mode support
 */
export function getSupabaseClient() {
  try {
    // For Capacitor apps, localStorage works reliably and is accessible to Supabase's internal storage
    // For web apps, use default Supabase storage (cookies for SSR, localStorage fallback)
    let storage = undefined

    if (Capacitor.isNativePlatform()) {
      console.log('🔐 Setting up localStorage for Capacitor app (mobile)')
      // Use localStorage directly - Supabase can access this reliably in Capacitor
      // This is simpler and more reliable than custom storage adapters
      storage = {
        getItem: (key: string) => {
          const value = localStorage.getItem(key)
          console.log('💾 Mobile localStorage GET:', key, value ? 'found' : 'not found')
          return value
        },
        setItem: (key: string, value: string) => {
          console.log('💾 Mobile localStorage SET:', key, 'saved')
          localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          console.log('💾 Mobile localStorage REMOVE:', key, 'removed')
          localStorage.removeItem(key)
        }
      }
    } else {
      console.log('🔐 Using default Supabase storage for web app')
      // Web app: use undefined to get Supabase's default storage (cookies + localStorage)
      storage = undefined
    }

    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: storage,
          persistSession: true,
          detectSessionInUrl: false,
          // Enable debugging for mobile to track session issues
          debug: Capacitor.isNativePlatform()
        }
      }
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
          onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
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
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    // Return a mock client that won't crash the app
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as unknown as ReturnType<typeof createBrowserClient>
  }
}
