

const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v1');
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open('v1');
  await cache.put(request, response);
};

const getOPFSDirs = async (userId, projectName) =>
{
  const opfsRoot = await navigator.storage.getDirectory();
  const userDirectoryHandle = await opfsRoot.getDirectoryHandle(userId);
  const projectDir = await userDirectoryHandle?.getDirectoryHandle(projectName);
  const mediaDir = await projectDir?.getDirectoryHandle("media", { create: true });
  return [projectDir, mediaDir];
}

const networkFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  // First try to get the resource from the network
  try
  {
    console.log("attemping network fetch", request);
    const responseFromNetwork = await fetch(request, {signal: AbortSignal.timeout(5000)});
    _hexOnLine = true;
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  }
  catch (error)
  {
    console.log(error, request);

    if (error.name === "TimeoutError")
      _hexOnLine = false;

    //let m = request.url.match(/.+\/web\/([^/]+)\/([^/]+)\/([^/]+)(?:\/)?(.*)/);
    let m = request.url.match(/https?:\/\/(?:[\w\d]+\.)?(?:[\w\d]+\.[\w\d]+)\/web\/([^/]+)\/([^/]+)\/([^/]+)(?:\/)?(.*)/);
    console.log("checking url", m, request.url);
    if (m)
    {
      const [_, userId, projectName, p1, p2] = m;
      const [projectDir, mediaDir] = await getOPFSDirs(userId, projectName);
      try
      {
        let fileHandle;
        if (p2)
        {
          console.log("should be 'media':", p1);
          fileHandle = await mediaDir.getFileHandle(p2, { create: true, });
        }
        else
        {
          fileHandle = await projectDir.getFileHandle(p1, { create: true, });
        }
        const file = await fileHandle.getFile();
        const data = await file.arrayBuffer();
        return new Response(data);
      }
      catch (innerError)
      {
        console.log(innerError);
      }
    }

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

// TODO: ongoing: ensure this list is correct
self.addEventListener('install', (event) => {
  event.waitUntil(
    addResourcesToCache([
      './edit',
      './hex/api.js',
      './hex/files.js',
      './hex/mcp.js',
      './hex/opfs.js',
      './hex/tabs.js',
      './hex/util.js',
      './builder/builder-attributes.js',
      './builder/builder-elements.js',
      './builder/builder-parser.js',
      './builder/builder-globals.js',
      './builder/builder-properties.js',
      './builder/builder-trash.js',
      './builder/builder.css',
      './builder/builder.js',
    ])
  );
});

self.addEventListener('fetch', (event) => {
  //debugger;
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
  
  // TODO: do
  // see https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
});