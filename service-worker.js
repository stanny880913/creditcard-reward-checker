const CACHE_NAME = 'rewards-checker-v3';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './js/data.js',
    './manifest.json',
    './images/icon-192.png',
    './images/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
