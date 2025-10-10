"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function getErrMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "message" in e && typeof (e as any).message === "string") {
    return (e as { message: string }).message;
  }
  return "Auth failed.";
}

export default function AuthCallback() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession();

        if (!error && data?.session) {
          if (!cancelled) {
            setMessage("Done. Redirecting…");
            router.replace("/app/templates");
          }
          return;
        }

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

        const code = search.get("code");
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