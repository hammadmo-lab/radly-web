/*
  public/sw.js — Service worker with safe handling for OAuth callback redirects
  - Bypasses /auth/callback and URLs with ?code=
  - Follows redirects for navigation fetches
  - Only caches 200 HTML responses
  - Emits simple console logs for debugging
*/

const APP_HTML_CACHE = 'radly-html-v1';
const OFFLINE_PAGE = '/offline.html';

// Utility to check if URL looks like OAuth callback
function isAuthCallbackUrl(url) {
  try {
    const u = new URL(url);
    // match path like /auth/callback and any query containing code=
    if (u.pathname.startsWith('/auth/callback')) return true;
    if (u.search && u.search.includes('code=')) return true;
    return false;
  } catch {
    return false;
  }
}

self.addEventListener('install', () => {
  // Skip waiting for faster deploys if desired (optional)
  self.skipWaiting();
  console.info('[SW] installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.info('[SW] activated');
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // Quick bypass: don't intercept OAuth callback navigation/fetches
  if (isAuthCallbackUrl(url)) {
    // Let the browser handle redirects for auth callback
    // Do not call event.respondWith() so the request is handled normally.
    console.debug('[SW] bypassing auth callback URL:', url);
    return;
  }

  // Only special-case navigation requests (page loads)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Explicitly follow redirects so we receive final navigated response (browser will also follow)
        const resp = await fetch(req, { redirect: 'follow' });

        // If the response is a redirect-like opaque redirect, return it - do not cache it
        // (Some browsers return response.type === 'opaqueredirect' for cross-origin redirects)
        if (resp.type === 'opaqueredirect' || (resp.status >= 300 && resp.status < 400)) {
          console.debug('[SW] navigation response is a redirect (returning without caching)', resp.status, url);
          return resp;
        }

        // Only cache successful HTML responses (200 + content-type text/html)
        const contentType = resp.headers.get('content-type') || '';
        if (resp.ok && contentType.includes('text/html')) {
          try {
            const cache = await caches.open(APP_HTML_CACHE);
            // Put a cloned copy into cache
            cache.put(req, resp.clone()).catch(err => {
              console.warn('[SW] cache.put failed (non-fatal):', err);
            });
          } catch (cacheErr) {
            console.warn('[SW] caching HTML failed:', cacheErr);
          }
        }

        return resp;
      } catch (err) {
        console.warn('[SW] fetch for navigation failed, attempting offline fallback:', err);
        // Fallback to cached index or offline page
        const cache = await caches.open(APP_HTML_CACHE);
        const cachedIndex = await cache.match('/');
        if (cachedIndex) return cachedIndex;
        const offline = await cache.match(OFFLINE_PAGE);
        if (offline) return offline;
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // For non-navigation requests, keep default behavior (do not interfere)
  // Optionally, you can implement runtime caching for assets here.
});
