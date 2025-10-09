"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { FileText, Mail, Apple } from 'lucide-react'
import { getRemaining, markSent } from '@/lib/otpThrottle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const timer = useRef<number | null>(null)

  // Keep countdown in sync with localStorage timestamp
  useEffect(() => {
    if (!email) return
    const { remaining } = getRemaining(email)
    setRemaining(remaining)
    if (timer.current) window.clearInterval(timer.current)
    if (remaining > 0) {
      timer.current = window.setInterval(() => {
        const { remaining } = getRemaining(email)
        setRemaining(remaining)
        if (remaining <= 0 && timer.current) {
          window.clearInterval(timer.current)
          timer.current = null
        }
      }, 1000)
    }
    return () => {
      if (timer.current) {
        window.clearInterval(timer.current)
        timer.current = null
      }
    }
  }, [email])

  const handleGoogleLogin = async () => {
    setSending(true)
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.info('Google OAuth redirectTo:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' }
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error('Failed to sign in with Google')
      console.error('Google login error:', error)
    } finally {
      setSending(false)
    }
  }

  const handleAppleLogin = async () => {
    setSending(true)
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.info('Apple OAuth redirectTo:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error('Failed to sign in with Apple')
      console.error('Apple login error:', error)
    } finally {
      setSending(false)
    }
  }

  const handleMagicLink = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email) return
    
    // Local throttle guard
    const t = getRemaining(email, 60)
    if (t.remaining > 0) {
      setRemaining(t.remaining)
      return
    }

    try {
      setSending(true)
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.info('Magic link redirectTo:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo }
      })
      
      if (error) {
        // Supabase returns: "For security purposes, you can only request this after 32 seconds."
        const m = /after\s+(\d+)\s+seconds/i.exec(error.message || '')
        if (m) {
          const serverSec = parseInt(m[1], 10)
          setRemaining(Math.max(serverSec, getRemaining(email, serverSec).remaining))
          toast.error(`Please wait ${serverSec} seconds before requesting another magic link`)
        } else {
          console.error('Auth error:', error)
          toast.error('Failed to send magic link')
        }
        return
      }
      
      // Success: start local window immediately
      markSent(t.key)
      setRemaining(60)
      toast.success('Check your email for the sign-in link.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">Radly</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue generating medical reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={sending}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleAppleLogin}
                disabled={sending}
              >
                <Apple className="w-4 h-4 mr-2" />
                Continue with Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                variant="default"
                disabled={sending || remaining > 0 || !email}
              >
                <Mail className="w-4 h-4 mr-2" />
                {remaining > 0 ? `Resend in ${remaining}s` : (sending ? 'Sending…' : 'Send Magic Link')}
              </Button>
            </form>

            {/* Back to home */}
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <Link href="/legal/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}