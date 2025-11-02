'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { storeAuthOrigin } from '@/lib/auth-origin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, ArrowLeft } from 'lucide-react'
import { signInWithAppleNative, signInWithGoogleNative } from '@/lib/native-auth'

function isNative(): boolean {
  if (typeof window === 'undefined') return false
  // Capacitor v7
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor
  return !!cap?.isNativePlatform?.()
}

export default function MobileSignIn() {
  const supabase = createBrowserSupabase()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = '/app/dashboard'

  useEffect(() => {
    // no-op, reserved for plugin init if needed
  }, [])

  const getRedirectUrl = () => {
    const fallback = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
    if (typeof window === 'undefined') return `${fallback}/auth/callback`
    const origin = window.location.origin
    return origin.startsWith('http') ? `${origin}/auth/callback` : `${fallback}/auth/callback`
  }

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)
    try {
      if (isNative()) {
        await signInWithGoogleNative()
        router.push(next)
        return
      }

      // Fallback to web OAuth
      storeAuthOrigin(next)
      const redirectTo = getRedirectUrl()
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithApple() {
    setLoading(true)
    setError(null)
    try {
      if (isNative()) {
        await signInWithAppleNative()
        router.push(next)
        return
      }

      // Fallback to web OAuth
      storeAuthOrigin(next)
      const redirectTo = getRedirectUrl()
      await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Apple sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      storeAuthOrigin(next)
      const emailRedirectTo = getRedirectUrl()
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })
      if (error) setError(error.message)
      else setError('Check your email for the magic link.')
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

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
        <button onClick={() => router.push('/')} className="absolute top-8 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors">
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
              {isNative() && (
                <div className="text-xs text-[rgba(111,231,183,0.85)] bg-[rgba(111,231,183,0.1)] px-3 py-2 rounded-full">📱 Native app detected</div>
              )}
            </div>

            <div className="space-y-3">
              <Button onClick={signInWithGoogle} disabled={loading} variant="outline" className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)]">Continue with Google</Button>
              <Button onClick={signInWithApple} disabled={loading} variant="outline" className="w-full justify-center gap-2 border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.45)] text-[rgba(207,207,207,0.95)] hover:bg-[rgba(12,16,28,0.6)]">Continue with Apple</Button>
            </div>

            <form onSubmit={sendMagicLink} className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(207,207,207,0.48)]">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(207,207,207,0.5)]" />
                <Input type="email" className="h-12 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] pl-11 pr-4 text-sm text-white placeholder:text-[rgba(207,207,207,0.5)] focus-visible:ring-[rgba(75,142,255,0.45)] focus-visible:ring-offset-0" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-2xl py-3 text-base shadow-[0_20px_50px_rgba(38,83,255,0.45)]">Send me a magic link</Button>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
