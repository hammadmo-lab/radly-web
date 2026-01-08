"use client";

import { useCallback, useEffect, useMemo, useState, useLayoutEffect } from "react";
import { createBrowserSupabase } from '@/lib/supabase/client'
import { isTestMode, getTestSession } from '@/lib/test-mode'

type AuthStatus = "loading" | "authenticated" | "signed_out";

export function useAuthToken() {
  const testSession = getTestSession()
  const [status, setStatus] = useState<AuthStatus>(() =>
    isTestMode() ? "authenticated" : "loading"
  );
  const [token, setToken] = useState<string | null>(() =>
    isTestMode() ? (testSession?.access_token || 'test-access-token') : null
  );
  const [userId, setUserId] = useState<string | null>(() =>
    isTestMode() ? (testSession?.user?.id || 'test-user-id-12345') : null
  );

  useLayoutEffect(() => {
    // Return early if already set in test mode
    if (isTestMode()) {
      return
    }

    let cancelled = false;
    let subscription: { unsubscribe?: () => void } | null = null;

    const init = async () => {
      try {
        const supabase = createBrowserSupabase();

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
