'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client-test'
import { getStoredAuthData, clearAuthOrigin } from '@/lib/auth-origin'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  type OtpType =
    | 'magiclink'
    | 'email'
    | 'sms'
    | 'phone_change'
    | 'email_change'
    | 'recovery'
    | 'invite'

  useEffect(() => {
    let cancelled = false

    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const queryAccessToken = searchParams.get('access_token')
    const queryRefreshToken = searchParams.get('refresh_token')
    const queryExpiresIn = searchParams.get('expires_in')
    const token = searchParams.get('token')
    const type = searchParams.get('type')
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
    const hasMagicLinkToken = !!token

    const handleCallback = async () => {
      if (cancelled) return

      if (error) {
        setStatus('error')
        setErrorMessage(errorDescription || error)
        setTimeout(() => {
          if (!cancelled) {
            router.push('/auth/signin')
          }
        }, 3000)
        return
      }

      if (!code && !hasOAuthTokens && !hasMagicLinkToken) {
        setStatus('error')
        setErrorMessage('Missing authorization parameters')
        setTimeout(() => {
          if (!cancelled) {
            router.push('/auth/signin')
          }
        }, 3000)
        return
      }

      try {
        const supabase = getSupabaseClient()

        // First check if we already have a valid session (native flow case)
        const { data: sessionData } = await supabase.auth.getSession()
        if (cancelled) return

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
            if (!cancelled) {
              router.push(redirectTo)
            }
          }, 500)
          return
        }

        // If magic link token is present (iOS deep link or web fallback), verify it directly
        if (hasMagicLinkToken) {
          const otpType: OtpType = (type as OtpType) || 'magiclink'
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token as string,
            type: otpType,
          })

          if (verifyError) {
            throw verifyError
          }
        } else if (code) {
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

        if (cancelled) return

        setStatus('success')

        // Get stored redirect from cookie or use default
        const { next } = getStoredAuthData()
        const redirectTo = next || '/app/dashboard'

        // Clear the stored auth data
        clearAuthOrigin()

        console.log('🔐 Auth callback successful, redirecting to:', redirectTo)

        // Use a small delay to ensure session is saved
        setTimeout(() => {
          if (!cancelled) {
            router.push(redirectTo)
          }
        }, 500)
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed')
        console.error('🔐 Auth callback error:', err)
        setTimeout(() => {
          if (!cancelled) {
            router.push('/auth/signin')
          }
        }, 3000)
      }
    }

    const isIOS =
      typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
    const isStandalone =
      typeof window !== 'undefined' &&
      ((window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        window.matchMedia?.('(display-mode: standalone)')?.matches)
    const shouldAttemptDeepLink = isIOS && !isStandalone && hasMagicLinkToken && (!type || type === 'magiclink')

    if (shouldAttemptDeepLink) {
      const appURL = `radly://auth/callback?token=${encodeURIComponent(token as string)}&type=${encodeURIComponent(
        type || 'magiclink'
      )}`

      // Attempt to open the native app; fallback to web auth if we remain on the page
      const fallbackTimer = window.setTimeout(() => {
        if (!cancelled) {
          const stillHere = document.visibilityState === 'visible' && document.hasFocus()
          if (stillHere) {
            void handleCallback()
          }
        }
      }, 2500)

      window.location.href = appURL

      return () => {
        cancelled = true
        clearTimeout(fallbackTimer)
      }
    }

    void handleCallback()

    return () => {
      cancelled = true
    }
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
