const CACHE_NAME = 'hero-os-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './bootstrap.js',
  './js/license.js',
  './manifest.json',
  './core/engine.js',
  './core/auto-plan.js',
  './core/storage.js',
  './core/template-loader.js',
  './core/insight.js',
  './modules/trainer/trainer-ui.js',
  './modules/trainer/trainer-template.json',
  './icons/hero-trainer.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
