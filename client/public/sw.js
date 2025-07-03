const CACHE_NAME = 'barelle-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache (à adapter selon ton routing)
const urlsToCache = [
  '/',
  '/products',
  '/manifest.json',
  '/offline.html',
  '/icon.svg',
];

// 🔧 Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache initial créé');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 🔁 Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('🧹 Suppression cache obsolète:', name);
            return caches.delete(name);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 📡 Gestion des requêtes
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
        })
      )
  );
});

// 🔔 Notifications Push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Voir',
        icon: '/icon.svg',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 📲 Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(self.clients.openWindow(url));
});