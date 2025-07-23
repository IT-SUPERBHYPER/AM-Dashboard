// Define the name of your cache
const CACHE_NAME = 'superb-hyper-dashboard-v1';

// List of URLs to cache when the service worker is installed
// This includes your HTML, CSS, JS, manifest, and icons
const urlsToCache = [
    './', // Caches the root path, which typically serves index.html
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com', // Tailwind CSS CDN
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap', // Inter font CSS
    // You should also include the actual font files if you want them to be truly offline
    // For simplicity, we're only caching the CSS link for now.
    './icon-192x192.png', // Your PWA icon
    './icon-512x512.png'  // Your PWA icon
];

// Install event: caches the static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to cache during install:', err);
            })
    );
});

// Fetch event: serves cached content when offline, or fetches from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If the request is in the cache, return the cached response
                if (response) {
                    return response;
                }
                // Otherwise, fetch from the network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We must clone it so that
                        // we can consume one in the cache and one in the browser.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback for when both cache and network fail
                        // You might want to serve a custom offline page here
                        console.log('Network request failed and no cache match.');
                        // For example, return a placeholder for images or a generic offline page
                        // return caches.match('/offline.html'); // If you have an offline.html
                    });
            })
    );
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
