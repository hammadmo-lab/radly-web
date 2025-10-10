"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

export function useAuthSession() {
  const supabase = useMemo(() => createClient(), []);
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
