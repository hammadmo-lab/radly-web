'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthError, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState('Completing sign-in…');

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseClient();

        // IMPORTANT: explicit exchange (do NOT rely on detectSessionInUrl)
        const { error }: {
          data: {
            session: Session | null;
            provider_token?: string | null;
            provider_refresh_token?: string | null;
          } | null;
          error: AuthError | null;
        } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (error) {
          console.error(error);
          setMsg(`Sign-in failed: ${error.message}`);
          return;
        }

        setMsg('Signed in. Redirecting…');
        router.replace('/app/reports');
      } catch (e: unknown) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'unknown error';
        setMsg(`Sign-in failed: ${errorMessage}`);
      }
    })();
  }, [router]);

  return <main className="mx-auto max-w-md py-16">{msg}</main>;
}