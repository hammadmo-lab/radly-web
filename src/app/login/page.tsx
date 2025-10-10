'use client';

import React, { useState } from 'react';
import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

type OAuthProvider = 'google' | 'apple';

function getOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.location.origin;
  } catch {
    return null;
  }
}

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

  async function handleSignIn(provider: OAuthProvider) {
    setLoading(provider);
    setErrorMsg(null);
    try {
      const origin = getOrigin();
      const redirectTo = origin ? `${origin}/auth/callback` : undefined;

      // Allow Supabase's actual return where data.url can be string | null
      const { data, error }: {
        data: { url?: string | null } | null;
        error: AuthError | null;
      } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      });

      if (error) throw error;

      const url = data?.url ?? undefined; // url may be string | null
      if (typeof window !== 'undefined' && url) {
        window.location.assign(url);
      }
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