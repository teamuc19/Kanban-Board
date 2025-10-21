// Deaktiviert Caching auf localhost (Dev), SW aktiv nur in Prod (Board.svelte)
if (self.location.hostname === "localhost") {
  self.addEventListener("fetch", () => {});
}

const CACHE = "kanban-cache-v2";
const ASSETS = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-256.png", "/icons/icon-512.png", "/favicon.svg", "/build/bundle.css", "/build/bundle.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Notify clients that a new version is active (optional)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  e.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone)).catch(()=>{});
        return res;
      }).catch(() => cached)
    )
  );
});
