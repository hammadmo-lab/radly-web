"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type AuthStatus = "loading" | "authenticated" | "signed_out";

export function useAuthToken() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseClient();

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const t = data.session?.access_token ?? null;
      setToken(t);
      setUserId(data.session?.user?.id ?? null);
      setStatus(t ? "authenticated" : "signed_out");
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (cancelled) return;
      const t = session?.access_token ?? null;
      setToken(t);
      setUserId(session?.user?.id ?? null);
      setStatus(t ? "authenticated" : "signed_out");
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  return useMemo(() => ({ status, token, userId, getAuthHeader }), [status, token, userId, getAuthHeader]);
}
