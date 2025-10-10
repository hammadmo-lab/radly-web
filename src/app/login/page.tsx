'use client';

import { getSupabaseClient } from '@/lib/supabase';
import * as React from 'react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : undefined;

  const signIn = async (provider: 'google' | 'apple') => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) alert(error.message);
  };

  const magic = async () => {
    const email = prompt('Enter your email for the magic link:')?.trim();
    if (!email) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) alert(error.message);
    else alert('Check your inbox for the magic link.');
  };

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <div className="space-x-4">
        <button onClick={() => signIn('google')}>Continue with Google</button>
        <button onClick={() => signIn('apple')}>Continue with Apple</button>
      </div>
      <div>
        <button onClick={magic}>Send me a magic link</button>
      </div>
    </main>
  );
}