"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from '@/lib/supabase/client'
import { isTestMode, getTestSession } from '@/lib/test-mode'
import { Capacitor } from '@capacitor/core'
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

    let unsub = () => {};

    async function initAuth() {
      if (Capacitor.isNativePlatform()) {
        // Use singleton client for native platforms
        const { getSupabaseClient } = await import('@/lib/supabase-singleton')
        const supabase = await getSupabaseClient()
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
        unsub = () => sub?.subscription?.unsubscribe?.()
      } else {
        // Use browser client for web
        const supabase = createBrowserSupabase()
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
        unsub = () => sub?.subscription?.unsubscribe?.()
      }
      setMounted(true)
    }

    initAuth()
    return () => unsub();
  }, []);

  return { session, isAuthed: !!session, mounted };
}
