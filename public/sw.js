const CACHE_NAME = "movicol-v2";
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
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // Skip API calls — any request to a different origin or known API paths
  if (requestUrl.origin !== self.location.origin) return;

  // Skip WebSocket and API paths
  if (
    requestUrl.pathname.startsWith("/socket.io") ||
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.startsWith("/auth/") ||
    requestUrl.pathname.startsWith("/graph/") ||
    requestUrl.pathname.startsWith("/siniestralidad/") ||
    requestUrl.pathname.startsWith("/predictions/") ||
    requestUrl.pathname.startsWith("/admin/") ||
    requestUrl.pathname.startsWith("/notifications") ||
    requestUrl.pathname.startsWith("/saved-routes") ||
    requestUrl.pathname.startsWith("/user/") ||
    requestUrl.pathname.startsWith("/preferences")
  ) return;

  // Cache-first for static assets
  if (
    requestUrl.pathname.includes("/assets/") ||
    requestUrl.pathname.includes("/icons/") ||
    requestUrl.pathname.endsWith(".js") ||
    requestUrl.pathname.endsWith(".css") ||
    requestUrl.pathname.endsWith(".png") ||
    requestUrl.pathname.endsWith(".svg") ||
    requestUrl.pathname.endsWith(".woff2") ||
    STATIC_ASSETS.some((a) => requestUrl.pathname === a)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
