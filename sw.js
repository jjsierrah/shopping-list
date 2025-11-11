// sw.js - Service Worker
const CACHE_NAME = 'jj-shopping-list-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalación: cachear los recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación: limpiar caché viejo
self.addEventListener('activate', (event) => {
  const currentCacheName = CACHE_NAME;
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== currentCacheName) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: servir desde caché o red
self.addEventListener('fetch', (event) => {
  // Solo cachear recursos del mismo origen
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});
