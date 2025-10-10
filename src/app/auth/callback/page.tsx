"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

function hasMessage(x: unknown): x is { message: string } {
  if (typeof x !== "object" || x === null) return false;
  const rec = x as Record<string, unknown>;
  return typeof rec.message === "string";
}

function getErrMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (hasMessage(e)) return e.message;
  return "Auth failed.";
}

function getWindowHash(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.hash;
}

function AuthCallbackContent() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const code = search.get("code");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code || "");

        if (!error && data?.session) {
          if (!cancelled) {
            setMessage("Done. Redirecting…");
            router.replace("/app/templates");
          }
          return;
        }

        const hash = getWindowHash();
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

        const fallback = "invalid request: both auth code and code verifier should be non-empty";
        setMessage(error?.message ?? (code ? "Unable to complete sign-in." : fallback));
      } catch (err: unknown) {
        if (!cancelled) setMessage(getErrMessage(err));
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

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="p-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}