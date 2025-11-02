'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { sanitizeNext } from '@/lib/redirect'
import { storeAuthOrigin } from '@/lib/auth-origin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Mail, Sparkles } from 'lucide-react'
import MobileSignIn from '@/components/mobile/MobileSignIn'

const allowMagic = process.env.NEXT_PUBLIC_ALLOW_MAGIC_LINK === '1'
const allowGoogle = process.env.NEXT_PUBLIC_ALLOW_GOOGLE === '1'
const allowApple = process.env.NEXT_PUBLIC_ALLOW_APPLE === '1'

function SignInContent() {
  const supabase = createBrowserSupabase()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const hasProviders = allowGoogle || allowApple

  // Get the next parameter or default to /app/dashboard
  const next = sanitizeNext(searchParams.get('next'))

  // Build redirect URL for current environment
  // IMPORTANT: This URL must exactly match one of the URLs in Supabase Dashboard
  // → Authentication → URL Configuration → Additional Redirect URLs
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3000/auth/callback'
    return `${window.location.origin}/auth/callback`
  }

  console.log('🔐 Auth flow:', {
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    next,
    redirectUrl: getRedirectUrl()
  })

  async function signInWithGoogle() {
    setLoading(true)
    try {
      // Store next path in cookie (primary method)
      storeAuthOrigin(next)

      // Use base callback URL WITHOUT query parameters
      // Supabase validates the base URL, not the query params
      const redirectTo = getRedirectUrl()

      console.log('🔐 Google OAuth redirect:', redirectTo, 'next:', next)

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo, // Base URL only, next param stored in cookie
        },
      })
    } finally {
      setLoading(false)
    }
  }

  async function signInWithApple() {
    setLoading(true)
    try {
      // Store next path in cookie (primary method)
      storeAuthOrigin(next)

      // Use base callback URL WITHOUT query parameters
      // Supabase validates the base URL, not the query params
      const redirectTo = getRedirectUrl()

      console.log('🔐 Apple OAuth redirect:', redirectTo, 'next:', next)

      await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo, // Base URL only, next param stored in cookie
        },
      })
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

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-7 text-center lg:text-left">
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

          <div className="hero-starfield relative overflow-hidden rounded-[40px] px-8 py-10 shadow-[0_36px_92px_rgba(31,64,175,0.45)] sm:px-10 sm:py-12">
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

              {hasProviders && (
                <div className="space-y-3">
                  {allowGoogle && (
                    <Button
                      onClick={signInWithGoogle}
                      disabled={loading}
                      variant="outline"
                      className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)]"
                    >
                      Continue with Google
                    </Button>
                  )}

                  {allowApple && (
                    <Button
                      onClick={signInWithApple}
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
    </main>
  )
}

export default function SignInPage() {
  const [isNative, setIsNative] = useState(false)
  useEffect(() => {
    // Detect Capacitor native at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (typeof window !== 'undefined' ? (window as any).Capacitor : undefined)
    setIsNative(!!cap?.isNativePlatform?.())
  }, [])

  if (isNative) {
    return <MobileSignIn />
  }

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
