'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;               // MUST be a number (or false), not a function
export const fetchCache = 'default-no-store';

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase";

function getOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.origin;
}

function hasMessage(x: unknown): x is { message: string } {
  return typeof x === 'object' && x !== null && typeof (x as any).message === 'string';
}

function getErrMessage(e: unknown) {
  if (typeof e === 'string') return e;
  if (hasMessage(e)) return e.message;
  return 'Authentication failed.';
}

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildRedirectTo = () => {
    const origin = getOrigin();
    return origin ? `${origin}/auth/callback` : undefined;
  };

  const handleSignIn = useCallback(async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = buildRedirectTo();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(getErrMessage(err));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return (
    <main className="mx-auto max-w-sm p-6 space-y-3">
      {error && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded">
          {error}
        </div>
      )}
      <button 
        className="btn btn-primary w-full" 
        onClick={() => handleSignIn('google')}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
      <button 
        className="btn w-full" 
        onClick={() => handleSignIn('apple')}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Continue with Apple'}
      </button>
    </main>
  );
}