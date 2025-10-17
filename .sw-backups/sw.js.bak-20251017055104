const CACHE_VERSION = 'radly-v2'

// Essential files only - will cache other resources on-demand
const STATIC_CACHE = [
  '/',
  '/manifest.json',
]

// Install event - cache only essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        // Cache files individually to prevent one failure from breaking everything
        return Promise.allSettled(
          STATIC_CACHE.map(url => 
            cache.add(url).catch(err => {
              console.warn('[SW] Failed to cache:', url, err)
              return null
            })
          )
        )
      })
      .then(() => {
        console.log('[SW] Installation complete')
      })
      .catch(err => {
        console.error('[SW] Installation failed:', err)
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
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', event.request.url)
        return cachedResponse
      }
      
      // CRITICAL FIX: Add redirect: 'follow' to handle redirects properly
      return fetch(event.request, {
        redirect: 'follow',
        credentials: 'same-origin'
      }).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          console.log('[SW] Not caching non-200 response:', event.request.url, response?.status)
          return response
        }
        
        // Don't cache redirects
        if (response.type === 'opaqueredirect') {
          console.log('[SW] Not caching redirect:', event.request.url)
          return response
        }
        
        // Don't cache HTML pages (they should always be fresh)
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          console.log('[SW] Not caching HTML:', event.request.url)
          return response
        }
        
        // Only cache same-origin responses
        if (response.type !== 'basic' && response.type !== 'cors') {
          return response
        }
        
        // Clone response for caching
        const responseToCache = response.clone()
        
        caches.open(CACHE_VERSION).then((cache) => {
          console.log('[SW] Caching new resource:', event.request.url)
          cache.put(event.request, responseToCache).catch(err => {
            console.warn('[SW] Failed to cache resource:', event.request.url, err)
          })
        })
        
        return response
      }).catch((error) => {
        console.error('[SW] Fetch failed:', event.request.url, error)
        // Try to return cached response if network fails
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[SW] Serving stale cache due to network error:', event.request.url)
            return cachedResponse
          }
          throw error
        })
      })
    })
  )
})

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})