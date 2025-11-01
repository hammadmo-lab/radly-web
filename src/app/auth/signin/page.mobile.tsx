'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-singleton'
import { storeAuthOrigin } from '@/lib/auth-origin'
import { signInWithAppleNative, signInWithGoogleNative } from '@/lib/native-auth'
import { getMobileMagicRedirectUrl } from '@/lib/auth-callback'
import { usePlatform } from '@/hooks/usePlatform'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Mail, Sparkles, ArrowLeft } from 'lucide-react'

const allowMagic = process.env.NEXT_PUBLIC_ALLOW_MAGIC_LINK === '1'
const allowGoogle = process.env.NEXT_PUBLIC_ALLOW_GOOGLE === '1'
const allowApple = process.env.NEXT_PUBLIC_ALLOW_APPLE === '1'

function MobileSignInContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()
  const { isNative } = usePlatform()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasProviders = allowGoogle || allowApple

  // Initialize Supabase client
  useEffect(() => {
    let mounted = true

    const initializeSupabase = async () => {
      try {
        const client = await getSupabaseClient()
        if (mounted) {
          setSupabase(client)
        }
      } catch (error) {
        console.error('Failed to initialize Supabase:', error)
        if (mounted) {
          setError('Failed to initialize authentication')
        }
      }
    }

    initializeSupabase()

    return () => {
      mounted = false
    }
  }, [])

  // Default to dashboard for mobile app
  const next = '/app/dashboard'

  console.log('🔐 Mobile Auth flow:', {
    isNative,
    next,
    platform: isNative ? 'native' : 'web'
  })

  async function signInWithGoogle() {
    if (!supabase) {
      setError('Authentication not initialized')
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (isNative) {
        // Native sign-in on iOS/Android
        console.log('🔵 Using native Google Sign-In')
        const signInResult = await signInWithGoogleNative()

        console.log('🔵 Sign-in completed successfully:', {
          user: signInResult.user?.email,
          hasSession: !!signInResult.session,
        })

        // The native auth function already verifies session persistence
        // If we get here, the session is already valid and stored
        console.log('🔵 Session verified by native auth, redirecting to dashboard')
        router.push(next)
      } else {
        // Fallback to web OAuth
        console.log('🔵 Using web-based Google OAuth as fallback')
        storeAuthOrigin(next)
        const redirectTo = `${window.location.origin}/auth/callback`

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

  async function signInWithApple() {
    if (!supabase) {
      setError('Authentication not initialized')
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (isNative) {
        // Native sign-in on iOS
        console.log('🍎 Using native Apple Sign-In')
        const signInResult = await signInWithAppleNative()

        console.log('🍎 Sign-in completed successfully:', {
          user: signInResult.user?.email,
          hasSession: !!signInResult.session,
        })

        // The native auth function already verifies session persistence
        // If we get here, the session is already valid and stored
        console.log('🍎 Session verified by native auth, redirecting to dashboard')
        router.push(next)
      } else {
        // Fallback to web OAuth
        console.log('🍎 Using web-based Apple OAuth as fallback')
        storeAuthOrigin(next)
        const redirectTo = `${window.location.origin}/auth/callback`

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
    if (!supabase) {
      setError('Authentication not initialized')
      return
    }
    setLoading(true)
    try {
      // Store next path in cookie
      storeAuthOrigin(next)

      // Use Universal Link (https) for magic link on mobile, configurable via env
      const emailRedirectTo = getMobileMagicRedirectUrl()

      console.log('🔐 Sending magic link:', {
        email,
        emailRedirectTo,
        next
      })

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setError('Check your email for the magic link.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ds-bg-gradient)] text-white">
      {/* Background effects matching main theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_18%_16%,rgba(75,142,255,0.25),transparent_60%),radial-gradient(circle_at_82%_8%,rgba(143,130,255,0.2),transparent_65%)]" />
        <div className="absolute inset-y-0 -left-24 w-72 bg-[radial-gradient(circle,rgba(63,191,140,0.2),transparent_68%)]" />
        <div className="absolute inset-y-0 -right-40 w-80 bg-[radial-gradient(circle,rgba(248,183,77,0.18),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-8 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="hero-starfield relative overflow-hidden rounded-[32px] px-6 py-8 shadow-[0_28px_72px_rgba(31,64,175,0.45)]">
          <div className="hero-aurora" />
          <div className="relative space-y-6">
            {/* Header */}
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.5)]">
                Mobile Access
              </p>
              <h1 className="text-2xl font-semibold">Welcome Back</h1>
              <p className="text-sm text-[rgba(207,207,207,0.7)] leading-relaxed">
                Sign in to access your Radly command center
              </p>
              {isNative && (
                <div className="text-xs text-[rgba(111,231,183,0.85)] bg-[rgba(111,231,183,0.1)] px-3 py-2 rounded-full">
                  📱 Native app detected - using secure device sign-in
                </div>
              )}
              {error && (
                <div className="text-xs text-red-400 bg-[rgba(255,107,107,0.1)] px-3 py-2 rounded-lg border border-red-500/30">
                  {error}
                </div>
              )}
            </div>

            {/* Native Sign-in Options */}
            {hasProviders && (
              <div className="space-y-3">
                {allowGoogle && (
                  <Button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    variant="outline"
                    className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)] h-12 rounded-2xl touch-manipulation"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                )}

                {allowApple && (
                  <Button
                    onClick={signInWithApple}
                    disabled={loading}
                    variant="outline"
                    className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)] h-12 rounded-2xl touch-manipulation"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Continue with Apple
                  </Button>
                )}
              </div>
            )}

            {/* Magic Link Option */}
            {allowMagic && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[rgba(255,255,255,0.1)]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[rgba(12,16,28,0.9)] px-2 text-[rgba(207,207,207,0.5)]">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={sendMagicLink} className="space-y-3">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(207,207,207,0.5)]" />
                    <Input
                      type="email"
                      className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] pl-10 pr-4 text-sm text-white placeholder:text-[rgba(207,207,207,0.5)] focus-visible:ring-[rgba(75,142,255,0.45)] focus-visible:ring-offset-0"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-3 text-base shadow-[0_16px_40px_rgba(38,83,255,0.45)] h-11 touch-manipulation"
                  >
                    {loading ? 'Sending...' : 'Send me a magic link'}
                  </Button>
                </form>
              </div>
            )}

            {/* Mobile-specific features highlight */}
            <div className="grid gap-2 text-left">
              <div className="flex items-start gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(8,12,24,0.4)] px-3 py-2 backdrop-blur-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[rgba(112,173,255,0.9)] flex-shrink-0" />
                <span className="text-xs text-[rgba(207,207,207,0.72)] leading-relaxed">
                  Native app sign-in with enhanced security
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(8,12,24,0.4)] px-3 py-2 backdrop-blur-sm">
                <Sparkles className="mt-0.5 h-4 w-4 text-[rgba(111,231,183,0.85)] flex-shrink-0" />
                <span className="text-xs text-[rgba(207,207,207,0.72)] leading-relaxed">
                  Syncs seamlessly across all your devices
                </span>
              </div>
            </div>

            {!hasProviders && !allowMagic && (
              <div className="text-center text-sm text-[rgba(207,207,207,0.58)]">
                No authentication method is currently enabled.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function MobileSignInPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen overflow-hidden bg-[var(--ds-bg-gradient)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_20%_18%,rgba(75,142,255,0.22),transparent_62%),radial-gradient(circle_at_78%_12%,rgba(143,130,255,0.18),transparent_65%)]" />
          <div className="absolute inset-y-0 -left-24 w-72 bg-[radial-gradient(circle,rgba(63,191,140,0.18),transparent_70%)]" />
          <div className="absolute inset-y-0 -right-40 w-80 bg-[radial-gradient(circle,rgba(248,183,77,0.16),transparent_72%)]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
          <div className="hero-starfield relative w-full max-w-sm rounded-[28px] px-6 py-8 text-center shadow-[0_28px_72px_rgba(31,64,175,0.45)]">
            <div className="hero-aurora" />
            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.5)]">
                Preparing mobile access
              </p>
              <h1 className="text-xl font-semibold">Loading sign-in</h1>
              <p className="text-sm text-[rgba(207,207,207,0.68)]">
                Preparing your secure mobile gateway...
              </p>
            </div>
          </div>
        </div>
      </main>
    }>
      <MobileSignInContent />
    </Suspense>
  )
}
