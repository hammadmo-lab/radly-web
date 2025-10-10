"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Preferred: PKCE flow. Handles ?code= and most hash flows internally.
        const { data, error } = await supabase.auth.exchangeCodeForSession();

        if (!error && data?.session) {
          if (!cancelled) {
            setMessage("Done. Redirecting…");
            router.replace("/app/templates");
          }
          return;
        }

        // Fallback: explicit fragment parsing if provider sent #access_token
        const hash = window.location.hash;
        if (!data?.session && hash && hash.includes("access_token")) {
          const params = new URLSearchParams(hash.slice(1));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && refresh_token) {
            const { data: setData, error: setErr } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (setErr) throw setErr;
            if (setData?.session && !cancelled) {
              setMessage("Done. Redirecting…");
              router.replace("/app/templates");
              return;
            }
          }
        }

        // Friendly message if we still failed
        const code = search.get("code");
        const fallback =
          "invalid request: both auth code and code verifier should be non-empty";
        setMessage(error?.message ?? (code ? "Unable to complete sign-in." : fallback));
      } catch (err: any) {
        if (!cancelled) setMessage(err?.message ?? "Auth failed.");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, search, supabase]);

  return (
    <main className="p-8">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}