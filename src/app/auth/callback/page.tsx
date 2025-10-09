'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function AuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // 1) Hash mode (magic link)
        if (typeof window !== 'undefined' && window.location.hash?.includes('access_token')) {
          const hash = new URLSearchParams(window.location.hash.slice(1)) // remove '#'
          const access_token = hash.get('access_token') || ''
          const refresh_token = hash.get('refresh_token') || ''

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) throw error
            toast.success('Successfully signed in!')
            router.replace('/app/templates')
            return
          }
        }

        // 2) PKCE code mode (OAuth)
        const code = params.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          toast.success('Successfully signed in!')
          router.replace('/app/templates')
          return
        }

        // 3) Nothing usable
        console.error('Auth callback: missing tokens')
        toast.error('Authentication failed - missing tokens')
        router.replace('/login?error=missing_tokens')
      } catch (error) {
        console.error('Auth callback failed:', error)
        toast.error('Authentication failed')
        router.replace('/login?error=auth_failed')
      }
    }

    handleAuthCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
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