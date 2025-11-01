"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-singleton";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export function SessionHydrator({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const isNative = Capacitor.isNativePlatform();
        const supabase = await getSupabaseClient();

        console.log('🔄 SessionHydrator: Starting hydration - Native platform:', isNative);

        // Step 1: Migrate old storage keys if needed
        if (isNative) {
          await migrateAuthKey();
        }

        // Step 2: Supabase will read from storage automatically, but we can assist in case of mismatched shapes
        if (isNative) {
          const { value } = await Preferences.get({ key: "radly.auth" });
          if (value) {
            try {
              const parsed = JSON.parse(value);
              const cur = parsed?.currentSession;
              if (cur?.access_token && cur?.refresh_token) {
                console.log('🔄 SessionHydrator: Restoring session from Preferences');
                await supabase.auth.setSession({
                  access_token: cur.access_token,
                  refresh_token: cur.refresh_token,
                });
                console.log('🔄 SessionHydrator: Session restored successfully');
              } else {
                console.log('🔄 SessionHydrator: No valid session in Preferences');
              }
            } catch (error) {
              console.error('🔄 SessionHydrator: Failed to parse stored session:', error);
              // Clean up corrupted data
              await Preferences.remove({ key: "radly.auth" });
            }
          } else {
            console.log('🔄 SessionHydrator: No stored session found');
          }
        }

        // Step 3: Touch getSession once to force hydration and verify
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('🔄 SessionHydrator: Error getting session:', error);
          // Clear broken data and stay logged out gracefully
          if (isNative) {
            await Preferences.remove({ key: "radly.auth" });
            await supabase.auth.signOut();
          }
        } else if (data.session) {
          console.log('🔄 SessionHydrator: Session hydrated successfully for user:', data.session.user?.email);
        } else {
          console.log('🔄 SessionHydrator: No active session');
        }

        // Step 4: Listen for auth changes for debugging
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session: Session | null) => {
            console.log('🔄 SessionHydrator: Auth state change:', event, !!session);
          }
        );

        if (mounted) {
          setReady(true);
        }

        // Cleanup subscription
        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('🔄 SessionHydrator: Hydration failed:', error);
        if (mounted) {
          setReady(true); // Still allow app to start even if hydration fails
        }
      }
    }


    // Handle deep links (magic links / OAuth) and route to in-app callback
    let removeDeepLink: (() => void) | null = null
    const routeDeepLink = (rawUrl: string) => {
      try {
        // Try URL parser first
        const u = new URL(rawUrl)
        if (u.protocol.startsWith('radly') || u.protocol.startsWith('capacitor')) {
          const path = u.pathname || '/auth/callback'
          let search = u.search || ''
          // If no search but the raw URL contains '?', grab it to avoid parser quirks
          if (!search && rawUrl.includes('?')) {
            search = rawUrl.substring(rawUrl.indexOf('?'))
          }
          const target = `${path}${search}`
          console.log('🔗 Deep link received:', rawUrl, '→ navigating to', target)
          window.location.href = target
        }
        } catch (e) {
        try {
          // Fallback: simple extraction for custom schemes
          const idx = rawUrl.indexOf('://')
          const afterScheme = idx >= 0 ? rawUrl.substring(idx + 3) : rawUrl
          const qIdx = afterScheme.indexOf('?')
          const path = '/' + afterScheme.split('/').slice(1).join('/')
          const qs = qIdx >= 0 ? afterScheme.substring(qIdx) : ''
          const target = `${path || '/auth/callback'}${qs}`
          console.log('🔗 Deep link (fallback) received:', rawUrl, '→ navigating to', target)
          window.location.href = target
        } catch (err) {
          console.error('Failed to handle deep link:', rawUrl, err)
        }
      }
    }

    if (Capacitor.isNativePlatform()) {
      // 1) Handle cold-start deep link
      App.getLaunchUrl().then((res) => {
        if (res?.url) {
          routeDeepLink(res.url)
        }
      }).catch(() => {})

      // 2) Handle warm deep links
      App.addListener('appUrlOpen', ({ url }) => routeDeepLink(url))
        .then(handle => { removeDeepLink = () => handle.remove() })
        .catch(() => {})
    }

    run();
    return () => { 
      mounted = false;
      try { removeDeepLink?.() } catch {}
    };
  }, []);

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Restoring...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Migration function to clean up old storage keys
async function migrateAuthKey() {
  const oldKeys = [
    "supabase.auth.token",
    "sb-bsldtgivgtyzacwyvcfh-auth-token", // your old project ref
  ];

  for (const key of oldKeys) {
    try {
      const { value } = await Preferences.get({ key });
      if (value) {
        await Preferences.set({ key: "radly.auth", value });
        await Preferences.remove({ key });
        console.log(`🔄 SessionHydrator: Migrated ${key} → radly.auth`);
        break; // Only migrate the first one we find
      }
    } catch (error) {
      console.error(`🔄 SessionHydrator: Failed to migrate key ${key}:`, error);
    }
  }
}
