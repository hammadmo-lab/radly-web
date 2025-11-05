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
import { Mail, ArrowLeft } from 'lucide-react'

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
  const [message, setMessage] = useState<string | null>(null)
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

  async function signInWithGoogle() {
    if (!supabase) {
      setError('Authentication not initialized')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      if (isNative) {
        await signInWithGoogleNative()
        router.push(next)
      } else {
        storeAuthOrigin(next)
        const redirectTo = `${window.location.origin}/auth/callback`

        await (supabase as SupabaseClient).auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        })
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Google Sign-In failed'
      console.error('Google Sign-In error:', err)
      setError(messageText)
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
    setMessage(null)
    try {
      if (isNative) {
        await signInWithAppleNative()
        router.push(next)
      } else {
        storeAuthOrigin(next)
        const redirectTo = `${window.location.origin}/auth/callback`

        await (supabase as SupabaseClient).auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo },
        })
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Apple Sign-In failed'
      console.error('Apple Sign-In error:', err)
      setError(messageText)
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
    setError(null)
    setMessage(null)
    try {
      storeAuthOrigin(next)
      const emailRedirectTo = getMobileMagicRedirectUrl()

      const { error: otpError } = await (supabase as SupabaseClient).auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
        },
      })
      if (otpError) {
        setError(otpError.message)
      } else {
        setMessage('Check your email for the magic link.')
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Failed to send magic link'
      setError(messageText)
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
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.5)]">Mobile Access</p>
              <h1 className="text-2xl font-semibold">Welcome Back</h1>
              <p className="text-sm text-[rgba(207,207,207,0.7)] leading-relaxed">Sign in to access your Radly command center</p>
              {isNative && (
                <div className="text-xs text-[rgba(111,231,183,0.85)] bg-[rgba(111,231,183,0.1)] px-3 py-2 rounded-full">📱 Native app detected - using secure device sign-in</div>
              )}
              {error && (
                <div className="text-xs text-red-400 bg-[rgba(255,107,107,0.1)] px-3 py-2 rounded-lg border border-red-500/30">
                  {error}
                </div>
              )}
              {message && (
                <div className="text-xs text-[rgba(111,231,183,0.85)] bg-[rgba(111,231,183,0.15)] px-3 py-2 rounded-lg border border-[rgba(111,231,183,0.3)]">
                  {message}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {allowGoogle && (
                <Button onClick={signInWithGoogle} disabled={loading} variant="outline" className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)]">Continue with Google</Button>
              )}
              {allowApple && (
                <Button onClick={signInWithApple} disabled={loading} variant="outline" className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)]">Continue with Apple</Button>
              )}
            </div>

            {allowMagic && (
              <form onSubmit={sendMagicLink} className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(207,207,207,0.48)]">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(207,207,207,0.5)]" />
                  <Input type="email" className="h-12 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] pl-11 pr-4 text-sm text-white placeholder:text-[rgba(207,207,207,0.5)] focus-visible:ring-[rgba(75,142,255,0.45)] focus-visible:ring-offset-0" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-2xl py-3 text-base shadow-[0_20px_50px_rgba(38,83,255,0.45)]">Send me a magic link</Button>
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
