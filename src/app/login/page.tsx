// src/app/login/page.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function Login() {
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseClient();
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);

  const toCallback = (path = '/auth/callback') => (origin ? `${origin}${path}` : undefined);

  const withBusy = (fn: () => Promise<void>) => async () => {
    try { setBusy(true); await fn(); } finally { setBusy(false); }
  };

  const signInGoogle = withBusy(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: toCallback(),
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) console.error(error);
  });

  const signInApple = withBusy(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: toCallback() },
    });
    if (error) console.error(error);
  });

  const sendMagicLink = withBusy(async () => {
    const email = prompt('Enter your email for the magic link:');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: toCallback() },
    });
    if (error) alert(error.message);
    else alert('Check your inbox for a login link.');
  });

  return (
    <main className="mx-auto max-w-md py-16 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      <button className="btn" onClick={signInGoogle} disabled={busy}>Continue with Google</button>

      {/* Render Apple only if you enable it in Supabase (it will still work if disabled, but sign-in will error) */}
      <button className="btn" onClick={signInApple} disabled={busy}>Continue with Apple</button>

      <div className="pt-2">
        <button className="btn-outline" onClick={sendMagicLink} disabled={busy}>Send me a magic link</button>
      </div>
    </main>
  );
}