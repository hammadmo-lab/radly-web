"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SigninAlias() {
  const router = useRouter()
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search)
    const nextRaw = usp.get('next') || undefined
    const next = nextRaw ? `?next=${encodeURIComponent(nextRaw)}` : ''
    router.replace(`/auth/signin${next}`)
  }, [router])
  return null
}
