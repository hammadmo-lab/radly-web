# Auth: Magic Links, Universal Links, and Deep Linking (Web + iOS)

This document summarizes the changes we made to fix Google OAuth and Magic Link sign‑in on web and iOS, and how to configure, test, and revert them.

## Overview

Goals:

- Make web Google OAuth robust (support PKCE and implicit flows).
- Make Magic Links reliable across iOS email clients (Universal Links), with a fallback for browser opens.
- Support native deep linking (Capacitor) so email taps open the app, and route to `/auth/callback` automatically.

## What Changed

### 1) Universal (https) callback for magic links

- Added helper: `src/lib/auth-callback.ts`
  - `getUniversalCallbackUrl()` → returns an https callback.
    - Prefers `NEXT_PUBLIC_UNIVERSAL_SITE_URL`, else `NEXT_PUBLIC_SITE_URL`.
    - If base is `localhost`/`127.0.0.1`, it falls back to `https://radly.app` for email reliability.
  - `getMobileMagicRedirectUrl()` → uses universal link by default; can switch to `capacitor://` via env.
  - `getWebCallbackUrl()` → builds an https callback for web flows.

- Magic-link senders now call these helpers:
  - Web: `src/app/auth/signin/page.web.tsx` uses `getUniversalCallbackUrl()`
  - Generic: `src/app/auth/signin/page.tsx` uses `isNative ? getMobileMagicRedirectUrl() : getUniversalCallbackUrl()`
  - Mobile (Capacitor build): `src/app/auth/signin/page.mobile.tsx` uses `getMobileMagicRedirectUrl()`

### 2) Server fallback for implicit flows (Safari/Universal Links)

- Updated server route handler: `src/app/auth/callback/route.web.ts`
  - If `code` param exists → server exchanges code and redirects to stored `next`.
  - If `code` is missing → returns a minimal HTML page that:
    - Reads tokens from URL hash/query,
    - Writes Supabase auth cookie `sb-<project>-auth-token` (base64url),
    - Clears temporary cookies (`auth_origin`, `auth_next`),
    - Strips hash from the URL, then redirects to stored `next` or `/app/dashboard`.
  - This fixes the Safari “missing code” case when the email link opens in the browser.

### 3) iOS deep linking (Capacitor + Universal Links)

- URL Schemes (Info.plist): ensure these top‑level items exist:
  - Google scheme (com.googleusercontent.apps.…)
  - `capacitor`
  - `radly` (custom, optional but recommended)

- Associated Domains (Entitlements):
  - `applinks:radly.app`
  - `applinks:www.radly.app`

- AASA files (served by Next):
  - `public/apple-app-site-association`
  - `public/.well-known/apple-app-site-association`
  - Headers added in `next.config.ts` and `next.config.web.ts` to serve JSON content type.

- Deep-link handler in app runtime:
  - `src/components/session-hydrator.tsx`
    - Registers both `App.getLaunchUrl()` (cold start) and `App.addListener('appUrlOpen')` (warm) to route `radly://…` and `capacitor://…` to `/auth/callback`.
    - More defensive parsing to preserve query string (`code`, `access_token`, etc.).

### 4) Vercel / Preview build route availability

- `scripts/prepare-build.js` (web branch) now copies:
  - `src/app/auth/callback/route.web.ts → route.ts`
  - `src/app/pricing/page.web.tsx → page.tsx`
  - `src/app/auth/signin/page.web.tsx → page.tsx` (new): ensures `/auth/signin` exists in previews.

## Environment Variables

- `NEXT_PUBLIC_SITE_URL` (existing): production/preview URL.
- `NEXT_PUBLIC_UNIVERSAL_SITE_URL` (new, recommended): explicit https base for email link callback.
  - Example: `https://radly.app`
  - If not set, the app falls back to `NEXT_PUBLIC_SITE_URL`. It will override localhost to `https://radly.app` for emails.
- `NEXT_PUBLIC_MOBILE_MAGIC_SCHEME` (optional): `universal` (default) or `capacitor`.
  - Use `capacitor` to send mobile emails with `capacitor://localhost/auth/callback` deep links.

`.env.example` documents these; `.env.local` is never committed.

## Supabase Settings

- Authentication → URL Configuration → Additional Redirect URLs:
  - Web/Universal: `https://radly.app/auth/callback` (plus preview domains)
  - Capacitor (optional): `capacitor://localhost/auth/callback`

## iOS Project Settings (Xcode)

- Info → URL Types:
  - Item 0 (Google): `CFBundleURLSchemes = [ com.googleusercontent.apps.… ]`
  - Item 1: `CFBundleURLName = capacitor`, `CFBundleURLSchemes = [ capacitor ]`
  - Item 2: `CFBundleURLName = radly`, `CFBundleURLSchemes = [ radly ]`

- Signing & Capabilities → Associated Domains:
  - `applinks:radly.app`, `applinks:www.radly.app`

- Reinstall app after changing URL schemes/entitlements (iOS caches them).

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

- iOS links do not open app (Capacitor scheme):
  - Gmail app often blocks custom schemes. Use Apple Mail or switch to Universal Links.

## Reverting Mobile to Capacitor Deep Links

1) Set `NEXT_PUBLIC_MOBILE_MAGIC_SCHEME=capacitor`.
2) `npm run build:mobile && npx cap sync ios && build/install`.
3) Email links will use `capacitor://localhost/auth/callback` again.

## Vercel / Preview

- Project Root must be `radly-frontend`.
- Build Command: `npm run build` (not `next build`) so our prepare/cleanup scripts run.
- Ensure Supabase env vars are set for the preview environment.
- Route table should list `/auth/signin` and `/auth/callback`.

---

Last updated: ensure this branch `fix/universal-magiclink-fallback` is deployed on the environment you’re testing so that `/auth/callback` includes the implicit fallback script.

