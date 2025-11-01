'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

interface AuthGuardHomeProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * AuthGuardHome
 *
 * Redirects authenticated users away from the home page to the dashboard.
 * This is a specialized version of AuthGuard for the home page.
 */
export function AuthGuardHome({ children, redirectTo = '/app/dashboard' }: AuthGuardHomeProps) {
  const { session, loading } = useAuth()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Only redirect once, and wait a bit longer for native auth listeners to fire
    if (!loading && session && !hasRedirected.current) {
      console.log('🔐 User is authenticated, scheduling redirect from home to:', redirectTo)
      hasRedirected.current = true

      // Give a small delay to ensure all auth state is settled
      const timer = setTimeout(() => {
        console.log('🔐 Executing redirect to:', redirectTo)
        router.push(redirectTo)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [session, loading, router, redirectTo])

  // Show children while checking auth or if user is not authenticated
  // If user is authenticated, they'll be redirected by useEffect
  return <>{children}</>
}
