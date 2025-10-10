'use client';

import { getSupabaseClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = React.useState('Finishing sign-in…');

  React.useEffect(() => {
    const code = params.get('code');
    if (!code) {
      setMsg('Missing auth code.');
      return;
    }
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg(`Sign-in failed: ${error.message}`);
          return;
        }
        router.replace('/app/reports');
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : 'Sign-in failed.');
      }
    })();
  }, [params, router]);

  return <main className="p-8">{msg}</main>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <CallbackContent />
    </Suspense>
  );
}