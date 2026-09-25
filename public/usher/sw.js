// @ts-check
/* Service worker for the Usher PWA. Must stay true (CYBERSECURITY.md §4):
   registered with scope "/usher/" from the app itself, never "/", so it
   cannot intercept the marketing page. It caches only GET responses: the
   shell and its same-origin assets so the app opens offline, and the last
   API answers so a list survives a dropped connection. Nothing here reads
   or stores anything about the person. Bump VERSION when the caching rules
   change; Astro's hashed asset names take care of the rest. */

const VERSION = "usher-v1";
const SHELL = "/usher/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.add(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/** @param {Request} request */
function isNavigation(request) {
  return request.mode === "navigate";
}

/** @param {URL} url */
function isSameOriginAsset(url) {
  return url.origin === self.location.origin && (url.pathname.startsWith("/_astro/") || url.pathname.startsWith("/usher/"));
}

/** @param {Request} request */
async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

/** @param {Request} request */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) return cached;
  const fresh = await refresh;
  if (fresh) return fresh;
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (isNavigation(request)) {
    event.respondWith(networkFirst(new Request(SHELL)));
    return;
  }
  if (isSameOriginAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (url.origin !== self.location.origin && url.pathname.includes("/v1/")) {
    event.respondWith(networkFirst(request));
  }
});
