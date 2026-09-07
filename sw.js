const CACHE_NAME = "vtech-pwa-v2";
const RUNTIME_NAME = "vtech-runtime-v1";
const RUNTIME_MAX = 80;

const PRECACHE = [
  "./",
  "./index.html",
  "./about.html",
  "./projects.html",
  "./systems.html",
  "./contact.html",
  "./offline.html",
  "./styles.css",
  "./app.js",
  "./page.js",
  "./js/inquire.js",
  "./js/supabase-config.js",
  "./js/pwa-register.js",
  "./site.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./images/vtech-logo.png",
];

const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch {
            /* Skip missing assets so install still succeeds. */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.hostname.includes("supabase.co")) return;
  if (request.destination === "video" || url.pathname.endsWith(".mp4")) return;

  if (isNavigation(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isSameOrigin(url) || isCdnAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

function isNavigation(request) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return request.destination === "document" || accept.includes("text/html");
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isCdnAsset(url) {
  return (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "cdnjs.cloudflare.com" ||
    url.hostname === "cdn.jsdelivr.net"
  );
}

function cacheKey(request) {
  const url = new URL(request.url);
  if (isSameOrigin(url)) {
    url.search = "";
    url.hash = "";
  }
  return url.href;
}

async function matchCached(request) {
  const cache = await caches.open(CACHE_NAME);
  const runtime = await caches.open(RUNTIME_NAME);
  return (
    (await cache.match(request)) ||
    (await cache.match(cacheKey(request))) ||
    (await runtime.match(request)) ||
    (await runtime.match(cacheKey(request)))
  );
}

async function networkFirst(request) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT_MS);
      }),
    ]);
    if (response && (response.ok || response.type === "opaque")) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(cacheKey(request), response.clone());
    }
    return response;
  } catch {
    const cached = await matchCached(request);
    if (cached) return cached;
    const fallback =
      (await matchCached(new Request("./index.html"))) ||
      (await caches.match("./offline.html"));
    return fallback || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cached = await matchCached(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response && (response.ok || response.type === "opaque")) {
        const runtime = await caches.open(RUNTIME_NAME);
        await runtime.put(cacheKey(request), response.clone());
        await trimRuntime(runtime);
      }
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

async function trimRuntime(cache) {
  const keys = await cache.keys();
  if (keys.length <= RUNTIME_MAX) return;
  await Promise.all(keys.slice(0, keys.length - RUNTIME_MAX).map((key) => cache.delete(key)));
}
