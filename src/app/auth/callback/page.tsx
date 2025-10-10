// src/app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // client page

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState('Completing sign-in…');

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseClient();

        // IMPORTANT: explicit exchange (do NOT rely on detectSessionInUrl)
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error(error);
          setMsg(`Sign-in failed: ${error.message}`);
          return;
        }

        setMsg('Signed in. Redirecting…');
        router.replace('/app/reports');
      } catch (e: any) {
        console.error(e);
        setMsg(`Sign-in failed: ${e?.message ?? 'unknown error'}`);
      }
    })();
  }, [router]);

  return <main className="mx-auto max-w-md py-16">{msg}</main>;
}