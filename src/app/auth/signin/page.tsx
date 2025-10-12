'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { sanitizeNext } from '@/lib/redirect'

const allowMagic = process.env.NEXT_PUBLIC_ALLOW_MAGIC_LINK === '1'
const allowGoogle = process.env.NEXT_PUBLIC_ALLOW_GOOGLE === '1'
const allowApple = process.env.NEXT_PUBLIC_ALLOW_APPLE === '1'

function SignInContent() {
  const supabase = createBrowserSupabase()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const origin =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || ''

  // Get the next parameter or default to /app/templates
  const next = sanitizeNext(searchParams.get('next'))

  async function signInWithGoogle() {
    setLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          // Supports PKCE Authorization Code by default
        },
      })
    } finally {
      setLoading(false)
    }
  }

  async function signInWithApple() {
    setLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
