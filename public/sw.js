const CACHE_NAME = 'quran-web-app-v1.0.0';
const STATIC_CACHE = 'quran-static-v1.0.0';
const DYNAMIC_CACHE = 'quran-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/Quran-web-app-pet-project/',
  '/Quran-web-app-pet-project/index.html',
  '/Quran-web-app-pet-project/static/js/bundle.js',
  '/Quran-web-app-pet-project/static/css/main.css',
  '/Quran-web-app-pet-project/manifest.json',
  '/Quran-web-app-pet-project/favicon.ico',
  '/Quran-web-app-pet-project/logo192.png',
  '/Quran-web-app-pet-project/logo512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.quran\.com\/chapters/,
  /^https:\/\/api\.quran\.com\/verses/,
  /^https:\/\/verses\.quran\.com\/Alafasy\/mp3/,
  /^https:\/\/download\.quranicaudio\.com\/quran\/mishary_rashid_alafasy/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  if (request.method === 'GET' && request.destination !== 'audio') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // For other requests, try network first
  event.respondWith(fetch(request));
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Return cached response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Static request failed:', error);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/Quran-web-app-pet-project/index.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data
    console.log('Performing background sync...');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New content available',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Open App',
          icon: '/logo192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/logo192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Quran Web App', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/Quran-web-app-pet-project/')
    );
  }
});