"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase-client-test'

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
    let unsubscribe: (() => void) | undefined

    const run = async () => {
      try {
        const supabase = getSupabaseClient()

        // Initial session
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: string, newSession: Session | null) => {
            setSession(newSession)
            setUser(newSession?.user ?? null)
            setLoading(false)
          }
        )
        unsubscribe = () => subscription.unsubscribe()
      } catch (error) {
        console.error('Error initializing auth provider:', error)
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }

    run()

    return () => {
      try { unsubscribe?.() } catch { /* noop */ }
    }
  }, [])

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()

      // Clear the token cache on sign out
      const { clearTokenCache } = await import('@/lib/http')
      clearTokenCache()
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
