const CACHE_NAME = "movicol-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests (POST, PUT, etc.)
  if (event.request.method !== "GET") return;

  // Skip API calls to backend
  if (event.request.url.includes("localhost:3001")) return;
  if (event.request.url.includes("localhost:8000")) return;

  // Skip WebSocket/socket.io
  if (event.request.url.includes("socket.io")) return;

  // Cache-first for static assets only
  if (event.request.url.includes("/assets/") || STATIC_ASSETS.some((a) => event.request.url.endsWith(a))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
