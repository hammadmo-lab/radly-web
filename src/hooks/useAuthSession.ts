"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from '@/lib/supabase-singleton'
import { isTestMode, getTestSession } from '@/lib/test-mode'
import type { Session, AuthChangeEvent, SupabaseClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

export function useAuthSession() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let unsub = () => {};

    // Initialize Supabase client first
    const initializeClient = async () => {
      try {
        const client = await getSupabaseClient()
        setSupabaseClient(client)

        // Return test session in test mode
        if (isTestMode()) {
          setSession(getTestSession())
          setMounted(true)
          return
        }

        // For native apps, add a delay to ensure storage is ready
        const initializeSession = async () => {
          try {
            console.log('🔐 useAuthSession: Initializing session...', { isNative: Capacitor.isNativePlatform() })

            // For mobile: ensure localStorage is accessible before session check
            if (Capacitor.isNativePlatform()) {
              console.log('🔐 Mobile: Testing localStorage access...')
              try {
                localStorage.setItem('test-key', 'test-value')
                const testValue = localStorage.getItem('test-key')
                localStorage.removeItem('test-key')
                console.log('🔐 Mobile: localStorage test passed:', testValue === 'test-value')
              } catch (error) {
                console.error('🔐 Mobile: localStorage test failed:', error)
              }

              // Small delay for storage to be ready
              await new Promise(resolve => setTimeout(resolve, 300))
            }

            const { data } = await client.auth.getSession()
            console.log('🔐 useAuthSession: Session loaded:', {
              hasSession: !!data.session,
              email: data.session?.user?.email,
              isNative: Capacitor.isNativePlatform(),
              sessionExpiresAt: data.session?.expires_at
            })

            if (Capacitor.isNativePlatform() && !data.session) {
              console.log('🔐 Mobile: No session found, checking localStorage directly...')
              // Check what's actually in localStorage
              const keys = Object.keys(localStorage)
              keys.forEach(key => {
                if (key.includes('supabase') || key.includes('auth')) {
                  console.log('🔐 Mobile localStorage key:', key, 'value present:', !!localStorage.getItem(key))
                }
              })
            }

            setSession(data.session)
          } catch (error) {
            console.error('🔐 useAuthSession: Error loading session:', error)
            setSession(null)
          }
        }

        initializeSession()

        const { data: sub } = client.auth.onAuthStateChange((_e: AuthChangeEvent, s: Session | null) => {
          console.log('🔐 useAuthSession: Auth state changed:', {
            event: _e,
            hasSession: !!s,
            email: s?.user?.email,
            isNative: Capacitor.isNativePlatform()
          })
          setSession(s)
        });

        unsub = () => sub?.subscription?.unsubscribe?.();
        setMounted(true);
      } catch (error) {
        console.error('🔐 useAuthSession: Failed to initialize client:', error)
        setMounted(true)
      }
    }

    initializeClient()

    return () => unsub();
  }, []);

  return { session, isAuthed: !!session, mounted };
}
