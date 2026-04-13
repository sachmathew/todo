// The version of the cache.
const VERSION = "v0.1";

const SUPER_PATH = "/todo";
const CACHE_NAME = `todo-${VERSION}`;

// The static resources that the app needs to function.
const APP_STATIC_RESOURCES = [
  `${SUPER_PATH}/`,
  `${SUPER_PATH}/index.html`,
  `${SUPER_PATH}/app.js`,
  `${SUPER_PATH}/style.css`,
  `${SUPER_PATH}/icons/small.svg`
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
  console.log("Service Worker install");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("Caching app");
      cache.addAll(APP_STATIC_RESOURCES);
    })(),
  );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return undefined;
        }),
      );
      //await clients.claim();
    }),
  );
});

// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const r = await caches.match(event.request);
      console.log(`Fetching resource: ${event.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      console.log(`Caching new resource: ${event.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })(),
  );
});
