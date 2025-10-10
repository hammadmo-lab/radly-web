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
        const code = params.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          router.replace('/app/templates'); return
        }

        if (typeof window !== 'undefined' && window.location.hash) {
          const h = new URLSearchParams(window.location.hash.slice(1))
          const access_token = h.get('access_token')
          const refresh_token = h.get('refresh_token')
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) throw error
            router.replace('/app/templates'); return
          }
        }

        // Nothing to exchange; go to login
        router.replace('/login')
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Authentication failed')
      }
    })()
  }, [params, router])

  return <div className="p-6 text-sm">{err ?? 'Signing you in…'}</div>
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}