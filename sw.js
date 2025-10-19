// シンプルPWA用 SW（Project Pages対応・相対パス版）
const CACHE_NAME = 'pwa-redirect-v3';
const ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest?v=3'
  // 必要ならアイコンも: 'icon-192.png', 'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ナビゲーション要求はオンライン優先＋オフライン時はoffline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./offline.html'))
    );
    return;
  }

  // 同一オリジンの静的資産はキャッシュ優先
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((res) => res || fetch(req))
    );
  }
  // 外部ドメインはSWでは扱わない（ブラウザ標準動作）
});
