"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from '@/lib/supabase/client'
import { isTestMode, getTestSession } from '@/lib/test-mode'
import type { Session } from '@supabase/supabase-js'

export function useAuthSession() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Return test session in test mode
    if (isTestMode()) {
      setSession(getTestSession())
      setMounted(true)
      return
    }

    let unsubscribe: (() => void) | undefined

    const init = async () => {
      const supabase = createBrowserSupabase()
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
      unsubscribe = () => sub?.subscription?.unsubscribe?.()
      setMounted(true)
    }

    void init()

    return () => {
      unsubscribe?.()
    }
  }, []);

  return { session, isAuthed: !!session, mounted };
}
