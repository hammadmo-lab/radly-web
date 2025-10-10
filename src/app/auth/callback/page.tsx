'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function AuthCallbackContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [msg, setMsg] = useState('Completing sign-in…');

  useEffect(() => {
    const run = async () => {
      // 1) Prefer query string
      let code = search?.get('code') ?? null;
      let next = search?.get('next') ?? '/app/templates';

      // 2) Fallback: parse from hash if someone redirected with #code=...
      if (!code && typeof window !== 'undefined' && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        code = hash.get('code');
        const hnext = hash.get('next');
        if (hnext) next = hnext;
        // Normalize URL once so refreshes keep the query params
        if (code) {
          const url = new URL(window.location.href);
          url.hash = '';
          url.searchParams.set('code', code);
          if (next) url.searchParams.set('next', next);
          window.history.replaceState({}, '', url.toString());
        }
      }

      if (!code) {
        setMsg('Missing authorization code. Please go back and try again.');
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          setMsg(`Sign-in failed: ${error.message}`);
          return;
        }
        // Success – send to next or app home
        router.replace(next || '/app/templates');
      } catch (e: unknown) {
        setMsg(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p className="p-6 text-sm text-muted-foreground">{msg}</p>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading...</p>}>
      <AuthCallbackContent />
    </Suspense>
  );
}