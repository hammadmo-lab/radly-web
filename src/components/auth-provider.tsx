"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase-singleton'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        // Use the singleton Supabase client
        const supabase = await getSupabaseClient()

        if (!mounted) return

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        // Handle refresh token errors gracefully
        if (error && error.message?.includes('Refresh Token Not Found')) {
          console.warn('🔐 AuthProvider: Invalid refresh token, clearing session')
          if (mounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }

        console.log('🔐 AuthProvider: Initial session check:', !!session)

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
          console.log('🔐 AuthProvider: Auth state changed, session:', !!session, 'event:', _event)

          // Be lenient on transient refresh states; rely on explicit SIGNED_OUT to clear
          if (mounted) {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
          }
        })

        if (mounted) {
          return () => subscription.unsubscribe()
        }
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  const signOut = async () => {
    try {
      const supabase = await getSupabaseClient()
      await supabase.auth.signOut()

      // Clear the token cache on sign out
      const { clearTokenCache } = await import('@/lib/http')
      clearTokenCache()

      // Force clear Google OAuth session on sign out
      try {
        const { isCapacitorNative } = await import('@/lib/platform')
        if (isCapacitorNative()) {
          const { SocialLogin } = await import('@capgo/capacitor-social-login')
          await SocialLogin.logout({ provider: 'google' })
          console.log('🔐 Cleared Google OAuth session on sign out')
        }
      } catch (socialError) {
        console.warn('Failed to clear Google OAuth session:', socialError)
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
