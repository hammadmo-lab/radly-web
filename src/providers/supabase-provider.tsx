/**
 * Supabase Provider for App-Level Initialization
 *
 * Ensures the Supabase singleton client is initialized once at app root
 * and provides the client to all child components via React Context.
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSupabaseClient, isSupabaseClientInitialized, resetSupabaseClient } from '@/lib/supabase-singleton'
import type { SupabaseClient } from '@supabase/supabase-js'
import { debugStorageState } from '@/lib/capacitor-storage'

interface SupabaseContextType {
  supabase: SupabaseClient | null
  isInitialized: boolean
  isInitializing: boolean
  error: Error | null
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isInitialized: false,
  isInitializing: true,
  error: null,
})

interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      console.log('🚀 SupabaseProvider: Initializing...')

      try {
        setIsInitializing(true)
        setError(null)

        // Initialize the singleton client
        const client = await getSupabaseClient()

        if (!mounted) return

        console.log('✅ SupabaseProvider: Client initialized')
        setSupabase(client)

        // Check for existing session
        console.log('🔍 SupabaseProvider: Checking for existing session...')
        const { data: { session }, error: sessionError } = await client.auth.getSession()

        if (sessionError) {
          console.error('❌ SupabaseProvider: Session check error:', sessionError)
        } else if (session) {
          console.log('✅ SupabaseProvider: Existing session found:', session.user.id)
        } else {
          console.log('ℹ️ SupabaseProvider: No existing session')
        }

        // Set up auth state change listener
        const { data: { subscription } } = client.auth.onAuthStateChange(
          (event, session) => {
            console.log('🔔 SupabaseProvider: Auth state change:', event, session?.user?.id || 'no session')

            if (event === 'SIGNED_IN' && session) {
              console.log('✅ SupabaseProvider: User signed in:', session.user.email)
            } else if (event === 'SIGNED_OUT') {
              console.log('ℹ️ SupabaseProvider: User signed out')
              // Optionally reset client on sign out
              // resetSupabaseClient()
            }
          }
        )

        // Debug storage state in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🐛 SupabaseProvider: Debugging storage state...')
          await debugStorageState()
        }

        setIsInitialized(true)
        setIsInitializing(false)

        // Return cleanup function
        return () => {
          console.log('🧹 SupabaseProvider: Cleaning up auth listener')
          subscription.unsubscribe()
        }

      } catch (err) {
        console.error('❌ SupabaseProvider: Initialization failed:', err)
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Supabase'))
          setIsInitializing(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  // Render loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2653FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Initializing...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl mb-4">⚠️ Initialization Error</div>
          <p className="text-white text-sm mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2653FF] text-white rounded-lg hover:bg-[#4B8EFF] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Provide context
  return (
    <SupabaseContext.Provider value={{ supabase, isInitialized, isInitializing, error }}>
      {children}
    </SupabaseContext.Provider>
  )
}

/**
 * Hook to access the Supabase client from context
 */
export function useSupabase(): SupabaseClient {
  const context = useContext(SupabaseContext)

  if (!context.supabase) {
    throw new Error('useSupabase must be used within SupabaseProvider and client must be initialized')
  }

  return context.supabase
}

/**
 * Hook to access Supabase initialization state
 */
export function useSupabaseState() {
  const context = useContext(SupabaseContext)
  return {
    isInitialized: context.isInitialized,
    isInitializing: context.isInitializing,
    error: context.error,
    hasClient: !!context.supabase,
  }
}

/**
 * Hook to access Supabase client safely (returns null if not initialized)
 */
export function useSupabaseOptional(): SupabaseClient | null {
  const context = useContext(SupabaseContext)
  return context.supabase
}