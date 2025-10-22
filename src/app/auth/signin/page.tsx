'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { sanitizeNext } from '@/lib/redirect'
import { storeAuthOrigin } from '@/lib/auth-origin'

const allowMagic = process.env.NEXT_PUBLIC_ALLOW_MAGIC_LINK === '1'
const allowGoogle = process.env.NEXT_PUBLIC_ALLOW_GOOGLE === '1'
const allowApple = process.env.NEXT_PUBLIC_ALLOW_APPLE === '1'

function SignInContent() {
  const supabase = createBrowserSupabase()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

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
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign in</h1>

        <div className="space-y-3">
          {allowGoogle && (
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full rounded-xl border py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Continue with Google
            </button>
          )}

          {allowApple && (
            <button
              onClick={signInWithApple}
              disabled={loading}
              className="w-full rounded-xl border py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Continue with Apple
            </button>
          )}
        </div>

        {allowMagic && (
          <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
            <label className="block text-sm">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black text-white py-2 text-sm hover:bg-gray-800 transition-colors"
            >
              Send me a magic link
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md rounded-2xl border p-8 shadow-sm">
          <h1 className="text-2xl font-semibold mb-6 text-center">Sign in</h1>
          <div className="text-center">Loading...</div>
        </div>
      </main>
    }>
      <SignInContent />
    </Suspense>
  )
}
