const CACHE_NAME = "movicol-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

globalThis.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  globalThis.skipWaiting();
});

globalThis.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  globalThis.clients.claim();
});

globalThis.addEventListener("fetch", (event) => {
  // Skip non-GET requests (POST, PUT, etc.)
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // Skip API calls to backend
  if (requestUrl.host === "localhost:3001") return;
  if (requestUrl.host === "localhost:8000") return;

  // Skip WebSocket upgrade requests (safe: checking parsed pathname, not raw URL)
  const WS_PATH = "/socket.io";
  if (requestUrl.pathname === WS_PATH || requestUrl.pathname.startsWith(WS_PATH + "/")) return;

  // Cache-first for static assets only
  if (requestUrl.pathname.includes("/assets/") || STATIC_ASSETS.some((a) => requestUrl.pathname.endsWith(a))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
