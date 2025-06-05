const CACHE_NAME = 'dj-player-cache-v2';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.url.endsWith('.mp3')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) =>
          cached ||
          fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          }).catch(() => new Response('Audio no disponible sin conexión.', {
            status: 404,
            statusText: 'No encontrado'
          }))
        )
      )
    );
  } else {
    event.respondWith(
      caches.match(request).then((response) => response || fetch(request))
    );
  }
});