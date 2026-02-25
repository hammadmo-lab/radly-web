'use client'

import Image from 'next/image'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { getTelegramConfirmUrl } from '@/lib/orchestrator'

type LinkState = 'loading' | 'success' | 'link-error' | 'network-error'

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i

function TelegramLinkShell({
  title,
  message,
  isLoading,
  action,
}: {
  title: string
  message: string
  isLoading?: boolean
  action?: ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--ds-bg-gradient)] px-6 text-white">
      <section className="neon-shell relative w-full max-w-md rounded-3xl border border-[rgba(255,255,255,0.08)] px-8 py-10 text-center shadow-[0_30px_80px_rgba(10,14,24,0.75)]">
        <div className="absolute inset-x-12 -top-24 h-44">
          <div className="hero-aurora" />
        </div>

        <div className="relative flex flex-col items-center space-y-6">
          <Image
            src="/brand/radly-icon-new.png"
            alt="Radly logo"
            width={72}
            height={72}
            className="h-[72px] w-[72px]"
            priority
          />

          {isLoading ? (
            <span className="relative block h-10 w-10" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border-2 border-[rgba(75,142,255,0.3)]" />
              <span className="absolute inset-0 rounded-full border-2 border-[rgba(245,215,145,0.85)] border-t-transparent animate-spin" />
            </span>
          ) : null}

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-[rgba(207,207,207,0.75)]">{message}</p>
          </div>

          {action ? <div className="w-full">{action}</div> : null}
        </div>
      </section>
    </main>
  )
}

function TelegramLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<LinkState>('loading')
  const [isRetrying, setIsRetrying] = useState(false)
  const hasStartedRef = useRef(false)
  const hasRedirectedRef = useRef(false)

  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const returnTo = useMemo(() => {
    if (!token) return '/telegram-link'
    const params = new URLSearchParams({ token })
    return `/telegram-link?${params.toString()}`
  }, [token])
  const isTokenValid = TOKEN_PATTERN.test(token)

  const redirectToSignIn = useCallback(() => {
    if (hasRedirectedRef.current) return
    hasRedirectedRef.current = true

    const params = new URLSearchParams({
      next: returnTo,
      returnTo,
    })
    router.replace(`/auth/signin?${params.toString()}`)
  }, [returnTo, router])

  const confirmLink = useCallback(async () => {
    const confirmUrl = getTelegramConfirmUrl()

    try {
      if (typeof window === 'undefined') {
        return
      }

      const supabase = createBrowserSupabase()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        redirectToSignIn()
        return
      }

      const response = await fetch(confirmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          supabase_jwt: session.access_token,
        }),
      })

      const body = await response.json().catch(() => null)

      if (response.ok && body?.success === true) {
        setState('success')
        return
      }

      setState('link-error')
    } catch (error) {
      console.error('[TelegramLink] confirm request failed', {
        endpoint: confirmUrl,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      setState('network-error')
    }
  }, [redirectToSignIn, token])

  useEffect(() => {
    if (!isTokenValid) return

    if (hasStartedRef.current) return
    hasStartedRef.current = true

    const timeoutId = window.setTimeout(() => {
      void confirmLink()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [confirmLink, isTokenValid])

  const retry = useCallback(async () => {
    setIsRetrying(true)
    setState('loading')
    await confirmLink()
    setIsRetrying(false)
  }, [confirmLink])

  if (!isTokenValid) {
    return (
      <TelegramLinkShell
        title="Link unavailable"
        message="This link has expired or has already been used. Send /start in the Radly Telegram bot to get a new link."
      />
    )
  }

  if (state === 'loading') {
    return (
      <TelegramLinkShell
        title="Linking Telegram"
        message="Please wait while we securely connect your Telegram account."
        isLoading
      />
    )
  }

  if (state === 'success') {
    return (
      <TelegramLinkShell
        title="Telegram linked"
        message="Your Telegram account has been linked! Return to Telegram to start using the bot."
        action={
          <Button asChild className="w-full">
            <a href="tg://">Open Telegram</a>
          </Button>
        }
      />
    )
  }

  if (state === 'network-error') {
    return (
      <TelegramLinkShell
        title="Connection issue"
        message="We could not reach the linking service. Please check your connection and try again."
        action={
          <Button onClick={retry} className="w-full" disabled={isRetrying}>
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        }
      />
    )
  }

  return (
    <TelegramLinkShell
      title="Link unavailable"
      message="This link has expired or has already been used. Send /start in the Radly Telegram bot to get a new link."
    />
  )
}

export default function TelegramLinkPage() {
  return (
    <Suspense
      fallback={
        <TelegramLinkShell
          title="Linking Telegram"
          message="Please wait while we securely connect your Telegram account."
          isLoading
        />
      }
    >
      <TelegramLinkContent />
    </Suspense>
  )
}
