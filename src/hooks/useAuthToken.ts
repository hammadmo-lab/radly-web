"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Capacitor } from '@capacitor/core'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { isTestMode, getTestSession } from '@/lib/test-mode'

type AuthStatus = "loading" | "authenticated" | "signed_out";

export function useAuthToken() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Return test token in test mode
    if (isTestMode()) {
      const testSession = getTestSession()
      setToken(testSession?.access_token || 'test-access-token')
      setUserId(testSession?.user?.id || 'test-user-id-12345')
      setStatus("authenticated")
      return
    }

    let cancelled = false;
    let subscription: { unsubscribe?: () => void } | null = null;

    const init = async () => {
      try {
        const supabase = Capacitor.isNativePlatform()
          ? await (await import('@/lib/supabase-singleton')).getSupabaseClient()
          : createBrowserSupabase();

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const t = data.session?.access_token ?? null;
        setToken(t);
        setUserId(data.session?.user?.id ?? null);
        setStatus(t ? "authenticated" : "signed_out");

        const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
          if (cancelled) return;
          const nextToken = session?.access_token ?? null;
          setToken(nextToken);
          setUserId(session?.user?.id ?? null);
          setStatus(nextToken ? "authenticated" : "signed_out");
        });
        subscription = sub?.subscription ?? null;
      } catch (error) {
        console.error('Failed to initialize auth token hook:', error);
        if (!cancelled) {
          setToken(null);
          setUserId(null);
          setStatus("signed_out");
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      subscription?.unsubscribe?.();
    };
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  return useMemo(() => ({ status, token, userId, getAuthHeader }), [status, token, userId, getAuthHeader]);
}
