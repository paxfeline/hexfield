

const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v1');
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open('v1');
  await cache.put(request, response);
};

const networkFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  // First try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request, {signal: AbortSignal.timeout(5000)});
    _hexOnLine = true;
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    if (error.name === "TimeoutError")
      _hexOnLine = false;

    // Next try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
      return responseFromCache;
    }

    // Next try to use the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
      console.info('using preload response', preloadResponse);
      putInCache(request, preloadResponse.clone());
      return preloadResponse;
    }

    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }

    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    // Enable navigation preloads!
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(enableNavigationPreload());
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    addResourcesToCache([
      './edit',
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    networkFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: './index.html',
    })
  );
});

// Hex communication

let _hexOnLine;

function hexOnLine()
{
  return _hexOnLine === undefined ? navigator.onLine : _hexOnLine;
}

self.addEventListener("message", (event) => {
  console.log(`Message received: ${event.data}`);
  if (event.data === "fetch timeout")
    _hexOnLine = false;
  if (event.data === "fetch success")
    _hexOnLine = true;
});