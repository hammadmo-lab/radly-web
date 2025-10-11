"use client";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from '@/lib/supabase/client'

export function useAuthSession() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);

  useEffect(() => {
    let unsub = () => {};
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    unsub = () => sub?.subscription?.unsubscribe?.();
    setMounted(true);
    return () => unsub();
  }, [supabase]);

  return { session, isAuthed: !!session, mounted };
}
