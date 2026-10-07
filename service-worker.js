// ============================================
// BLOOPVILLE - Service Worker
// Enables offline support and PWA install
// ============================================

const CACHE_NAME = 'bloopville-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/pages/characters.html',
    '/pages/products.html',
    '/pages/about.html',
    '/pages/contact.html',
    '/pages/track.html',
    '/pages/admin.html',
    '/assets/css/style.css',
    '/assets/js/main.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Bloopville SW: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('Bloopville SW: Cache failed', err))
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Bloopville SW: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});
