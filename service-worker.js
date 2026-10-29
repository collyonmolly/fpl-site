const CACHE_NAME = 'fpl-community-v1';
const APP_FILE = new URL('./index.html', self.registration.scope).href;
const ASSETS = [
  APP_FILE,
  new URL('./fpl-config.js', self.registration.scope).href,
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of ASSETS) {
      try {
        const req = new Request(url, { mode: url.startsWith(self.location.origin) ? 'same-origin' : 'no-cors' });
        const response = await fetch(req);
        await cache.put(req, response.clone());
      } catch (_) { /* Keep installation available if a CDN is temporarily unavailable. */ }
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('fpl-community-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request);
      if (response && (response.ok || response.type === 'opaque')) cache.put(event.request, response.clone()).catch(() => {});
      return response;
    } catch (_) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        const app = await cache.match(APP_FILE);
        if (app) return app;
      }
      return new Response('This item is not available offline yet. Open the page online once to cache it.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
