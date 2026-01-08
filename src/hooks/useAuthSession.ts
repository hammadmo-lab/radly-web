"use client";
import { useEffect, useState, useLayoutEffect } from "react";
import { createBrowserSupabase } from '@/lib/supabase/client'
import { isTestMode, getTestSession } from '@/lib/test-mode'
import type { Session } from '@supabase/supabase-js'

export function useAuthSession() {
  const [mounted, setMounted] = useState(() => isTestMode());
  const [session, setSession] = useState<Session | null>(() => {
    // Lazy initializer for test mode
    if (isTestMode()) {
      return getTestSession()
    }
    return null
  });

  useLayoutEffect(() => {
    // Return early if already set in test mode
    if (isTestMode()) {
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
