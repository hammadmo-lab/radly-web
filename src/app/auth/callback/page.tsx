'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        // 1) Hash mode (magic link) - check for access_token in hash first
        if (typeof window !== 'undefined' && window.location.hash?.includes('access_token')) {
          const hash = new URLSearchParams(window.location.hash.slice(1)) // remove '#'
          const access_token = hash.get('access_token')
          const refresh_token = hash.get('refresh_token')
          
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) throw error
            router.replace('/app/templates'); return
          }
        }

        // 2) PKCE code mode (OAuth) - check for ?code= parameter
        const code = params.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (error) throw error
          router.replace('/app/templates'); return
        }

        // 3) Nothing usable - redirect to login
        router.replace('/login')
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Authentication failed'
        setErr(errorMessage)
      }
    })()
  }, [params, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center">
      <div className="text-center">
        {err ? (
          <div className="space-y-4">
            <p className="text-red-600">{err}</p>
            <button 
              onClick={() => router.replace('/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Go to login
            </button>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}