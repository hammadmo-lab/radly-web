'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/supabase-browser'
import { sanitizeNext } from '@/lib/redirect'
import { storeAuthOrigin } from '@/lib/auth-origin'
import { signInWithAppleNative, signInWithGoogleNative } from '@/lib/native-auth'
import { usePlatform } from '@/hooks/usePlatform'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Mail, Sparkles } from 'lucide-react'

const allowMagic = process.env.NEXT_PUBLIC_ALLOW_MAGIC_LINK === '1'
const allowGoogle = process.env.NEXT_PUBLIC_ALLOW_GOOGLE === '1'
const allowApple = process.env.NEXT_PUBLIC_ALLOW_APPLE === '1'

function SignInContent() {
  const supabase = getSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isNative } = usePlatform()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasProviders = allowGoogle || allowApple

  // Get the next parameter or default to /app/dashboard
  const next = sanitizeNext(searchParams.get('next'))

  // Build redirect URL for web OAuth flow
  // For native, signInWithAppleNative/signInWithGoogleNative handle redirects directly
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3000/auth/callback'
    return `${window.location.origin}/auth/callback`
  }

  console.log('🔐 Auth flow:', {
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    isNative,
    next
  })

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    try {
      if (isNative) {
        // Native sign-in on iOS/Android
        console.log('🔵 Using native Google Sign-In')
        const signInResult = await signInWithGoogleNative()

        console.log('🔵 Sign-in returned, result:', {
          user: signInResult.user?.email,
          hasSession: !!signInResult.session,
        })

        // Wait longer for session to persist to storage
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Try to get session - should be available now
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔵 Session after 2s wait:', !!session, {
          email: session?.user?.email,
          expiresAt: session?.expires_at,
        })

        if (session) {
          console.log('🔵 Session detected, redirecting to dashboard')
          router.push(next)
        } else {
          console.log('🔵 No session found after wait, forcing refresh...')
          // Try forcing a refresh
          await supabase.auth.refreshSession()
          const { data: { session: sessionAfterRefresh } } = await supabase.auth.getSession()
          console.log('🔵 Session after refresh:', !!sessionAfterRefresh)

          if (sessionAfterRefresh) {
            router.push(next)
          } else {
            console.error('🔵 Failed to establish session')
            setError('Sign-in failed: Unable to establish session. Please try again.')
          }
        }
      } else {
        // Web OAuth flow
        console.log('🔵 Using web-based Google OAuth')
        storeAuthOrigin(next)
        const redirectTo = getRedirectUrl()

        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google Sign-In failed'
      console.error('🔵 Google Sign-In error:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAppleSignIn() {
    setLoading(true)
    setError(null)
    try {
      if (isNative) {
        // Native sign-in on iOS
        console.log('🍎 Using native Apple Sign-In')
        const signInResult = await signInWithAppleNative()

        const userEmail = 'user' in signInResult && signInResult.user ? signInResult.user.email : undefined
        console.log('🍎 Sign-in returned, result:', {
          user: userEmail,
          hasSession: !!signInResult.session,
        })

        // Wait longer for session to persist to storage
        console.log('🍎 Waiting 2 seconds for session to persist...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Try to get session - should be available now
        console.log('🍎 Checking for session after wait...')
        const { data: { session } } = await supabase.auth.getSession()

        console.log('🍎 Session after 2s wait:', !!session, {
          email: session?.user?.email,
          expiresAt: session?.expires_at,
          hasAccessToken: !!session?.access_token,
        })

        // Add Xcode-visible logging
        if (typeof window !== 'undefined' && window.console) {
          window.console.log('🍎 SESSION CHECK RESULT:', !!session)
          window.console.log('🍎 SESSION EMAIL:', session?.user?.email || 'none')
        }

        if (session) {
          console.log('🍎 Session detected, redirecting to dashboard')
          if (typeof window !== 'undefined' && window.console) {
            window.console.log('🍎 SUCCESS: Redirecting to dashboard')
          }
          router.push(next)
        } else {
          console.log('🍎 No session found after wait, forcing refresh...')
          if (typeof window !== 'undefined' && window.console) {
            window.console.log('🍎 NO SESSION: Attempting refresh')
          }

          // Try forcing a refresh
          await supabase.auth.refreshSession()
          const { data: { session: sessionAfterRefresh } } = await supabase.auth.getSession()
          console.log('🍎 Session after refresh:', !!sessionAfterRefresh)

          if (typeof window !== 'undefined' && window.console) {
            window.console.log('🍎 SESSION AFTER REFRESH:', !!sessionAfterRefresh)
          }

          if (sessionAfterRefresh) {
            router.push(next)
          } else {
            console.error('🍎 Failed to establish session')
            if (typeof window !== 'undefined' && window.console) {
              window.console.log('🍎 FINAL FAILURE: No session found')
            }
            setError('Sign-in failed: Unable to establish session. Please try again.')
          }
        }
      } else {
        // Web OAuth flow
        console.log('🍎 Using web-based Apple OAuth')
        storeAuthOrigin(next)
        const redirectTo = getRedirectUrl()

        await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo },
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple Sign-In failed'
      console.error('🍎 Apple Sign-In error:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      // Store next path in cookie (primary method)
      storeAuthOrigin(next)

      // Use base callback URL WITHOUT query parameters
      // Supabase validates the base URL, not the query params
      const emailRedirectTo = getRedirectUrl()

      console.log('🔐 Sending magic link:', {
        email,
        emailRedirectTo,
        next
      })

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo, // Base URL only, next param stored in cookie
        },
      })
      if (error) {
        alert(error.message)
      } else {
        alert('Check your email for the magic link.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ds-bg-gradient)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_18%_16%,rgba(75,142,255,0.25),transparent_60%),radial-gradient(circle_at_82%_8%,rgba(143,130,255,0.2),transparent_65%)]" />
        <div className="absolute inset-y-0 -left-24 w-72 bg-[radial-gradient(circle,rgba(63,191,140,0.2),transparent_68%)]" />
        <div className="absolute inset-y-0 -right-40 w-80 bg-[radial-gradient(circle,rgba(248,183,77,0.18),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
          {/* Left side - Marketing copy (hidden on mobile, shown on desktop) */}
          <div className="hidden space-y-7 text-center lg:block lg:text-left">
            <span className="tag-pulse text-[0.65rem] uppercase tracking-[0.4em]">
              <strong>Radly</strong> Access
            </span>
            <h1 className="text-4xl font-semibold sm:text-5xl">
              Sign in to your neon command center
            </h1>
            <p className="mx-auto max-w-xl text-[0.95rem] text-[rgba(207,207,207,0.72)] lg:mx-0">
              Pick up your findings, templates, and review threads right where you left them. The Radly shell now glows across every auth touchpoint.
            </p>
            <div className="grid gap-3 text-left">
              <div className="flex items-start gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,24,0.6)] px-4 py-3 backdrop-blur-md">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[rgba(112,173,255,0.9)]" />
                <span className="text-sm text-[rgba(207,207,207,0.72)]">
                  Session-aware redirects keep your active report, queue slots, and assistant state intact.
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,24,0.6)] px-4 py-3 backdrop-blur-md">
                <Sparkles className="mt-1 h-5 w-5 text-[rgba(111,231,183,0.85)]" />
                <span className="text-sm text-[rgba(207,207,207,0.72)]">
                  Neon visual language aligns auth with the redesigned dashboard, generate flow, and notifications.
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Sign-in form (centered on mobile, regular on desktop) */}
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <div className="hero-starfield relative overflow-hidden rounded-3xl px-6 py-8 shadow-[0_24px_60px_rgba(31,64,175,0.45)] sm:rounded-[40px] sm:px-10 sm:py-12">
            <div className="hero-aurora" />
            <div className="relative space-y-8">
              <div className="space-y-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.5)]">
                  Welcome back
                </p>
                <h2 className="text-3xl font-semibold">Sign in</h2>
                <p className="text-sm text-[rgba(207,207,207,0.7)]">
                  Choose a provider or request a magic link to continue.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {hasProviders && (
                <div className="space-y-3">
                  {allowGoogle && (
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      variant="outline"
                      className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)]"
                    >
                      Continue with Google
                    </Button>
                  )}

                  {allowApple && (
                    <Button
                      onClick={handleAppleSignIn}
                      disabled={loading}
                      variant="outline"
                      className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)]"
                    >
                      Continue with Apple
                    </Button>
                  )}
                </div>
              )}

              {allowMagic && (
                <form onSubmit={sendMagicLink} className="space-y-4">
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(207,207,207,0.48)]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(207,207,207,0.5)]" />
                    <Input
                      type="email"
                      className="h-12 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] pl-11 pr-4 text-sm text-white placeholder:text-[rgba(207,207,207,0.5)] focus-visible:ring-[rgba(75,142,255,0.45)] focus-visible:ring-offset-0"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl py-3 text-base shadow-[0_20px_50px_rgba(38,83,255,0.45)]"
                  >
                    Send me a magic link
                  </Button>
                </form>
              )}

              {!hasProviders && !allowMagic && (
                <div className="text-center text-sm text-[rgba(207,207,207,0.58)]">
                  No authentication method is currently enabled.
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen overflow-hidden bg-[var(--ds-bg-gradient)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_20%_18%,rgba(75,142,255,0.22),transparent_62%),radial-gradient(circle_at_78%_12%,rgba(143,130,255,0.18),transparent_65%)]" />
          <div className="absolute inset-y-0 -left-24 w-72 bg-[radial-gradient(circle,rgba(63,191,140,0.18),transparent_70%)]" />
          <div className="absolute inset-y-0 -right-40 w-80 bg-[radial-gradient(circle,rgba(248,183,77,0.16),transparent_72%)]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-5 py-16">
          <div className="hero-starfield relative w-full max-w-md rounded-[36px] px-8 py-10 text-center shadow-[0_32px_88px_rgba(31,64,175,0.45)]">
            <div className="hero-aurora" />
            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.5)]">
                Preparing experience
              </p>
              <h1 className="text-2xl font-semibold">Loading sign-in</h1>
              <p className="text-sm text-[rgba(207,207,207,0.68)]">
                Hang tight while we ready the neon auth shell.
              </p>
            </div>
          </div>
        </div>
      </main>
    }>
      <SignInContent />
    </Suspense>
  )
}
