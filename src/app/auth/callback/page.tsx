'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function AuthCallback() {
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseClient();
        // This reads the code from the URL and finishes PKCE
        const { error } = await supabase.auth.exchangeCodeForSession();
        if (error) throw error;
        router.replace('/app/reports');
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Sign-in failed: invalid flow state');
      }
    })();
  }, [router]);

  return <div className="p-6">{err ?? 'Signing you in…'}</div>;
}