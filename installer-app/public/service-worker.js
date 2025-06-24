const CACHE_NAME = "installer-pwa-cache-v1";
const API_CACHE_NAME = "installer-api-cache-v1";
const STATIC_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // API requests - network first
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches
            .open(API_CACHE_NAME)
            .then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "SYNC_OFFLINE_QUEUE" }),
        );
      }),
    );
  }
});
