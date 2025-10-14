const CACHE_VERSION = 'radly-v2'
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/brand/radly.svg',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg',
  // Add other static assets that should be cached
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return
  
  // Skip API requests (always fresh)
  if (event.request.url.includes('/api/')) return
  
  // Skip Supabase requests (authentication)
  if (event.request.url.includes('.supabase.co')) return
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      
      return fetch(event.request, {
        redirect: 'follow',        // CRITICAL: Allow redirects
        credentials: 'same-origin'  // Maintain credentials for auth
      }).then((response) => {
        // Add check for redirect responses
        if (response.type === 'opaqueredirect') {
          return response
        }
        
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response
        }
        
        // Don't cache HTML pages (they should always be fresh)
        if (response.headers.get('content-type')?.includes('text/html')) {
          return response
        }
        
        // Clone response for caching
        const responseToCache = response.clone()
        
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        
        return response
      }).catch((error) => {
        console.error('[SW] Fetch error:', error)
        // Return a fallback response or re-throw the error
        throw error
      })
    })
  )
})