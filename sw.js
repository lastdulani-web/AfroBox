// AfroBox service worker: cache the app shell so the app opens fully offline.
// Bump VERSION whenever you change any file, so phones pick up the update.
const VERSION = 'afrobox-v3';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/styles.css',
  'js/app.js', 'js/db.js', 'js/meta.js', 'js/player.js',
  'assets/logo-full.png', 'assets/wordmark.png', 'assets/disc.png',
  'icons/icon-192-v2.png', 'icons/icon-512-v2.png', 'icons/icon-maskable-512-v2.png', 'icons/apple-touch-icon-v2.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
    )
  );
});
