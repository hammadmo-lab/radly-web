'use client';

import React, { useState } from 'react';
import type { AuthError, Session } from '@supabase/supabase-js';
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

// Type guards / helpers
function hasMessage(x: unknown): x is { message: string } {
  return typeof x === 'object' && x !== null && 'message' in x && typeof (x as Record<string, unknown>).message === 'string';
}
function errToMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (hasMessage(e)) return e.message;
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

      const { data, error }: { data: { url?: string } | null; error: AuthError | null } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            queryParams: { prompt: 'select_account' },
          },
        });

      if (error) throw error;

      // In some environments Supabase returns a URL to navigate to
      if (typeof window !== 'undefined' && data?.url) {
        window.location.assign(data.url);
      }
    } catch (e: unknown) {
      setErrorMsg(errToMessage(e));
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