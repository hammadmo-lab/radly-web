/**
 * Global Singleton Supabase Client for Mobile Apps
 *
 * Fixes session persistence by ensuring only ONE client instance exists
 * across the entire app, surviving Next.js HMR and module re-evaluation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { createCapacitorStorageAdapter, getStorageBridge } from './capacitor-storage'

// Global declarations for singleton persistence
declare global {
  var __supabase_client: SupabaseClient | undefined
  var __supabase_client_initialized: boolean | undefined
}

// Ensure global exists for Capacitor compatibility
if (typeof global === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).global = globalThis
}

/**
 * Create singleton Supabase client that survives HMR and module re-evaluation
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  // Prevent server-side execution
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient() can only be called on the client side')
  }

  // Return existing instance if already initialized
  if (global.__supabase_client && global.__supabase_client_initialized) {
    console.log('♻️ Reusing existing Supabase singleton client')
    return global.__supabase_client
  }

  // Prevent concurrent initialization
  if (global.__supabase_client_initialized) {
    console.log('⏳ Waiting for existing Supabase initialization...')

    // Wait for initialization to complete
    let attempts = 0
    while (!global.__supabase_client && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    if (global.__supabase_client) {
      return global.__supabase_client
    }

    throw new Error('Supabase client initialization timeout')
  }

  // Mark as initializing
  global.__supabase_client_initialized = true
  console.log('🔧 Creating NEW Supabase singleton instance...')

  try {
    const isNative = ((): boolean => {
      if (typeof window === 'undefined') return false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cap = (window as any).Capacitor
      return !!cap?.isNativePlatform?.()
    })()
    console.log(`📱 Platform detected: ${isNative ? 'Native (Capacitor)' : 'Web'}`)

    // Initialize storage for native apps
    let storage = undefined
    if (isNative) {
      console.log('📦 Initializing Capacitor storage bridge...')
      const storageBridge = getStorageBridge()
      await storageBridge.initialize()
      storage = createCapacitorStorageAdapter()
      console.log('✅ Capacitor storage bridge initialized')
    }

    let client: SupabaseClient

    if (isNative) {
      // Native Capacitor builds use the direct Supabase client with a custom storage adapter
      client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            storage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            debug: true,
          },
        }
      )
    } else {
      // Web builds use Supabase's SSR-aware browser client to keep cookies and storage in sync
      client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            flowType: 'pkce',
            debug: false,
          },
        }
      )
    }

    // Store in global scope (survives HMR and module re-evaluation)
    global.__supabase_client = client

    // Tag instance for debugging
    ;(client as unknown as { __isSingleton?: boolean }).__isSingleton = true
    ;(client as unknown as { __createdAt?: string }).__createdAt = new Date().toISOString()
    ;(client as unknown as { __platform?: string }).__platform = isNative ? 'capacitor' : 'web'

    console.log('✅ Supabase singleton client created successfully')
    console.log(`📍 Client instance: ${(client as unknown as { __createdAt?: string }).__createdAt}`)

    return client

  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    global.__supabase_client_initialized = false
    throw error
  }
}

/**
 * Synchronous getter - throws if not initialized
 * Use only after calling getSupabaseClient() at least once
 */
export function getSupabaseClientSync(): SupabaseClient {
  if (!global.__supabase_client) {
    throw new Error(
      'Supabase client not initialized. Call getSupabaseClient() first.'
    )
  }
  return global.__supabase_client
}

/**
 * Check if Supabase client is initialized
 */
export function isSupabaseClientInitialized(): boolean {
  return !!(global.__supabase_client && global.__supabase_client_initialized)
}

/**
 * Reset singleton (for testing or logout scenarios)
 */
export function resetSupabaseClient(): void {
  console.log('🔄 Resetting Supabase singleton client')
  global.__supabase_client = undefined
  global.__supabase_client_initialized = false
}

/**
 * Get debug information about the current client
 */
export function getSupabaseClientDebugInfo(): {
  isSingleton?: boolean
  createdAt?: string
  platform?: string
  initialized?: boolean
  hasAuth?: boolean
  error?: string
} {
  const client = global.__supabase_client
  if (!client) {
    return { error: 'No client initialized' }
  }

  return {
    isSingleton: !!(client as unknown as { __isSingleton?: boolean }).__isSingleton,
    createdAt: (client as unknown as { __createdAt?: string }).__createdAt,
    platform: (client as unknown as { __platform?: string }).__platform,
    initialized: global.__supabase_client_initialized,
    hasAuth: !!(client.auth),
  }
}
