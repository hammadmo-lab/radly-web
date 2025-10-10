'use client';

import React, { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

type OAuthProvider = 'google' | 'apple';

function toErrorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e && typeof (e as Record<string, unknown>).message === 'string') {
    return (e as { message: string }).message;
  }
  return 'Unexpected error';
}

export default function LoginPage() {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check for required environment variables
  const hasRequiredEnvs = typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  async function handleSignIn(provider: OAuthProvider) {
    setLoading(provider);
    setErrorMsg(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const redirectTo = origin ? `${origin}/auth/callback` : undefined;
      const supabase = getSupabaseClient();

      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
          skipBrowserRedirect: false
        }
      });
    } catch (e: unknown) {
      setErrorMsg(toErrorMessage(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">Sign in to Radly</h1>

        {!hasRequiredEnvs && (
          <p role="alert" className="text-sm text-yellow-600 border border-yellow-200 rounded-md p-2">
            Warning: Missing required environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
          </p>
        )}

        {errorMsg && (
          <p role="alert" className="text-sm text-red-600 border border-red-200 rounded-md p-2">
            {errorMsg}
          </p>
        )}

        <div className="grid gap-3">
          <Button
            onClick={() => handleSignIn('google')}
            disabled={loading !== null}
            aria-busy={loading === 'google'}
          >
            {loading === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </Button>

          <Button
            onClick={() => handleSignIn('apple')}
            disabled={loading !== null}
            aria-busy={loading === 'apple'}
            variant="secondary"
          >
            {loading === 'apple' ? 'Redirecting…' : 'Continue with Apple'}
          </Button>
        </div>
      </div>
    </main>
  );
}