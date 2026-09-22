// Service worker for installability + faster repeat loads.
//
// Deliberately does NOT cache anything financial: no Inertia page responses,
// no XHR/API calls, no HTML navigations except the offline fallback. A
// finance app showing a cached balance while offline is worse than showing
// nothing — the user could act on a number that's already wrong. Everything
// dynamic is always network-first/network-only.
//
// What it does cache: the build's hashed JS/CSS/font assets (cache-first —
// safe because a content change means a new filename, never a stale hit)
// and the offline fallback page, so navigating while offline gets a clear
// message instead of a browser error screen.

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `penniepal-static-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [OFFLINE_URL, '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

function isBuildAsset(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/build/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return; // never intercept writes
  }

  const url = new URL(request.url);

  // Hashed build output: cache-first, populate on miss. Safe to cache
  // indefinitely since the filename changes whenever the content does.
  if (isBuildAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));

        return response;
      })),
    );

    return;
  }

  // Page navigations: network-only, with the offline page as the sole
  // fallback. Everything else (Inertia data, API calls) also goes straight
  // to the network and is simply left alone on failure — no caching, no
  // stale data.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
  }
});
