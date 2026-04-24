// service-worker.js
// Zorgt voor offline werking en snelle laadtijden

const CACHE_NAAM = 'kapperbot-v1';
const TE_CACHEN = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap'
];

// Installeren — cache alle bestanden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAAM).then((cache) => {
      return cache.addAll(TE_CACHEN);
    })
  );
  self.skipWaiting();
});

// Activeren — verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNamen) => {
      return Promise.all(
        cacheNamen
          .filter((naam) => naam !== CACHE_NAAM)
          .map((naam) => caches.delete(naam))
      );
    })
  );
  self.clients.claim();
});

// Fetch — geef gecachte versie als offline
self.addEventListener('fetch', (event) => {
  // API calls nooit cachen
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((gecached) => {
      if (gecached) return gecached;
      return fetch(event.request).then((response) => {
        // Sla nieuwe bestanden op in cache
        if (response.status === 200) {
          const kopie = response.clone();
          caches.open(CACHE_NAAM).then((cache) => {
            cache.put(event.request, kopie);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback voor HTML pagina's
        if (event.request.destination === 'document') {
          return caches.match('/dashboard.html');
        }
      });
    })
  );
});

// Push notificaties voor afspraakherinneringen
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const titel = data.titel || 'KapperBot';
  const opties = {
    body: data.bericht || 'Je hebt een nieuwe afspraak',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dashboard.html' },
    actions: [
      { action: 'bekijk', title: 'Bekijk afspraak' },
      { action: 'sluit', title: 'Sluiten' }
    ]
  };
  event.waitUntil(self.registration.showNotification(titel, opties));
});

// Klik op notificatie
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'bekijk' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/dashboard.html')
    );
  }
});
