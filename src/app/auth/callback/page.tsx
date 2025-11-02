'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-singleton'
import { getStoredAuthData, clearAuthOrigin } from '@/lib/auth-origin'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      const queryAccessToken = searchParams.get('access_token')
      const queryRefreshToken = searchParams.get('refresh_token')
      const queryExpiresIn = searchParams.get('expires_in')
      const hashParams =
        typeof window !== 'undefined' && window.location.hash
          ? new URLSearchParams(window.location.hash.substring(1))
          : null
      const hashAccessToken = hashParams?.get('access_token')
      const hashRefreshToken = hashParams?.get('refresh_token')
      const hashExpiresIn = hashParams?.get('expires_in')
      const accessToken = queryAccessToken || hashAccessToken || undefined
      const refreshToken = queryRefreshToken || hashRefreshToken || undefined
      const expiresIn = queryExpiresIn || hashExpiresIn || undefined
      const hasOAuthTokens = !!accessToken || !!refreshToken

      if (error) {
        setStatus('error')
        setErrorMessage(errorDescription || error)
        setTimeout(() => router.push('/auth/signin'), 3000)
        return
      }

      if (!code && !hasOAuthTokens) {
        setStatus('error')
        setErrorMessage('Missing authorization code')
        setTimeout(() => router.push('/auth/signin'), 3000)
        return
      }

      try {
        const supabase = await getSupabaseClient()

        // First check if we already have a valid session (native flow case)
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          console.log('🔐 Session already exists (native flow), skipping PKCE exchange')
          setStatus('success')

          // Get stored redirect from cookie or use default
          const { next } = getStoredAuthData()
          const redirectTo = next || '/app/dashboard'

          // Clear the stored auth data
          clearAuthOrigin()

          console.log('🔐 Auth callback successful (existing session), redirecting to:', redirectTo)

          setTimeout(() => {
            router.push(redirectTo)
          }, 500)
          return
        }

        // If no session exists and we have a code, try PKCE exchange (web flow case)
        if (code) {
          console.log('🔐 No session found, attempting PKCE exchange for web flow')
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            throw exchangeError
          }
        } else {
          if (!accessToken) {
            throw new Error('Authentication failed: missing access token')
          }
          if (!refreshToken) {
            throw new Error('Authentication failed: missing refresh token')
          }

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            throw sessionError
          }
          if (!data.session) {
            throw new Error('Authentication failed: session not returned')
          }

          if (expiresIn) {
            console.log('🔐 OAuth implicit flow detected, expires in:', expiresIn)
          }

          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
          }
        }

        setStatus('success')

        // Get stored redirect from cookie or use default
        const { next } = getStoredAuthData()
        const redirectTo = next || '/app/dashboard'

        // Clear the stored auth data
        clearAuthOrigin()

        console.log('🔐 Auth callback successful, redirecting to:', redirectTo)

        // Use a small delay to ensure session is saved
        setTimeout(() => {
          router.push(redirectTo)
        }, 500)
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed')
        console.error('🔐 Auth callback error:', err)
        setTimeout(() => router.push('/auth/signin'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4 p-4">
      {status === 'loading' && (
        <>
          <div className="text-lg font-medium">Completing sign in...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </>
      )}

      {status === 'success' && (
        <div className="text-lg font-medium text-green-600">Sign in successful! Redirecting...</div>
      )}

      {status === 'error' && (
        <>
          <div className="text-lg font-medium text-red-600">Sign in failed</div>
          <div className="text-sm text-red-500 text-center max-w-md">{errorMessage}</div>
          <div className="text-sm text-muted-foreground">Redirecting to login...</div>
        </>
      )}
    </div>
  )
}
