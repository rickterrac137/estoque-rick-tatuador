const CACHE_NAME = "estoque-cache-v2";
const urlsToCache = [
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", event => {
  console.log("Service Worker: Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("Service Worker: Ativo");
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      if(event.request.mode === "navigate") return caches.match("./index.html");
    })
  );
});
