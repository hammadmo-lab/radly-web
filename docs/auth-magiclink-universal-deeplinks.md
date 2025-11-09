# Auth: Magic Links & Universal Links (Web)

This document summarizes the changes we made to fix Google OAuth and Magic Link sign‑in on the web, and how to configure, test, and revert them.

## Overview

Goals:

- Make web Google OAuth robust (support PKCE and implicit flows).
- Make Magic Links reliable across iOS email clients (Universal Links), with a fallback for browser opens.
*Native app deep links have been removed; this document now focuses solely on the web magic-link flow.*

## What Changed

### 1) Universal (https) callback for magic links

- Added helper: `src/lib/auth-callback.ts`
  - `getUniversalCallbackUrl()` → returns an https callback.
    - Prefers `NEXT_PUBLIC_UNIVERSAL_SITE_URL`, else `NEXT_PUBLIC_SITE_URL`.
    - If base is `localhost`/`127.0.0.1`, it falls back to `https://radly.app` for email reliability.
  - `getMobileMagicRedirectUrl()` → currently returns the universal callback (legacy name retained for backwards compatibility).
  - `getWebCallbackUrl()` → builds an https callback for web flows.

- Magic-link senders now call these helpers:
  - `src/app/auth/signin/page.tsx` uses `getUniversalCallbackUrl()` when sending magic links and OAuth requests.

### 2) Server fallback for implicit flows (Safari/Universal Links)

- Updated server route handler: `src/app/auth/callback/route.web.ts`
  - If `code` param exists → server exchanges code and redirects to stored `next`.
  - If `code` is missing → returns a minimal HTML page that:
    - Reads tokens from URL hash/query,
    - Writes Supabase auth cookie `sb-<project>-auth-token` (base64url),
    - Clears temporary cookies (`auth_origin`, `auth_next`),
    - Strips hash from the URL, then redirects to stored `next` or `/app/dashboard`.
  - This fixes the Safari “missing code” case when the email link opens in the browser.

## Environment Variables
## Environment Variables

- `NEXT_PUBLIC_SITE_URL` (existing): production/preview URL.
- `NEXT_PUBLIC_UNIVERSAL_SITE_URL` (optional but recommended): explicit https base for email link callback.
  - Example: `https://radly.app`
  - If not set, the app falls back to `NEXT_PUBLIC_SITE_URL`. It will override localhost to `https://radly.app` for emails.

`.env.example` documents these; `.env.local` is never committed.

## Supabase Settings

- Authentication → URL Configuration → Additional Redirect URLs:
  - `https://radly.app/auth/callback` (plus preview domains)

## Testing & Validation

### Web
1) Visit `/auth/signin` and send a magic link. Email should include `redirect_to=https://radly.app/auth/callback` (or your preview domain).
2) Open link on desktop Safari/Chrome: you should land on the dashboard; if Safari opens the page itself, the fallback script will set the cookie and redirect.

### iOS / Mobile
1) From the app, send a magic link.
2) Use Apple Mail or Safari; Gmail app may block custom schemes.
3) If Universal Links are configured for the domain, tapping the email should open the app. You should see:
   - Xcode logs: `🔗 Deep link received: … → /auth/callback`
   - Then redirect to dashboard and stay signed in.

## Troubleshooting

- “Sign‑in error: missing code” on Safari:
  - The server `/auth/callback` fallback may not be deployed yet. Visit `/auth/callback` directly; if you do not see “Completing sign in…”, redeploy.

- Email shows `redirect_to=http://localhost:3000/auth/callback`:
  - Ensure `NEXT_PUBLIC_UNIVERSAL_SITE_URL` is set to production https URL or rely on the override (helper forces `radly.app` when it detects localhost).

- iOS links do not open app (Universal Links):
  - Make sure AASA files are reachable and served with `application/json`.
  - Check Associated Domains entitlement and reinstall the app.
  - Universal Links may need a device reboot or link long‑press → “Open in Radly”.

## Vercel / Preview

- Project Root must be `radly-frontend`.
- Build Command: `npm run build` (not `next build`) so our prepare/cleanup scripts run.
- Ensure Supabase env vars are set for the preview environment.
- Route table should list `/auth/signin` and `/auth/callback`.

---

Last updated: ensure this branch `fix/universal-magiclink-fallback` is deployed on the environment you’re testing so that `/auth/callback` includes the implicit fallback script.
