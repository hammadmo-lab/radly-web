"use client";

import { useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const redirectTo = useMemo(
    () => `${window.location.origin}/auth/callback`,
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,                 // must be same-origin as the page that started OAuth
        skipBrowserRedirect: false, // full-page redirect (no popup/new tab)
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) console.error("Google sign-in error", error);
  }, [supabase, redirectTo]);

  const signInWithApple = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });
    if (error) console.error("Apple sign-in error", error);
  }, [supabase, redirectTo]);

  return (
    <main className="mx-auto max-w-sm p-6 space-y-3">
      <button className="btn btn-primary w-full" onClick={signInWithGoogle}>
        Continue with Google
      </button>
      <button className="btn w-full" onClick={signInWithApple}>
        Continue with Apple
      </button>
    </main>
  );
}