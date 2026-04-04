// Dalil Tounes Service Worker
// Version: 1.0.0
// Stratégie: Cache-First pour assets, Network-First pour données

const CACHE_NAME = 'dalil-tounes-v1';
const STATIC_CACHE = 'dalil-static-v1';
const DYNAMIC_CACHE = 'dalil-dynamic-v1';

// Assets à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // Page hors ligne (à créer si besoin)
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Cache des assets statiques');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force le nouveau SW à prendre le contrôle immédiatement
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Supprimer les anciens caches
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
          })
          .map((name) => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Prend le contrôle de toutes les pages immédiatement
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les navigations vers webcontainer (environnement de dev)
  if (url.hostname.includes('webcontainer') || url.hostname.includes('local-credentialless')) {
    return;
  }

  // Ignorer les requêtes vers Supabase (toujours network-first)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cloner la réponse pour la mettre en cache
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // En cas d'échec, essayer le cache
          return caches.match(request);
        })
    );
    return;
  }

  // Stratégie Cache-First pour les assets statiques (JS, CSS, images)
  if (
    request.url.match(/\.(js|css|png|jpg|jpeg|webp|svg|gif|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Asset trouvé dans le cache
          return cachedResponse;
        }
        // Asset non trouvé, le télécharger et le mettre en cache
        return fetch(request).then((response) => {
          // Cloner la réponse
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Stratégie Network-First pour les pages HTML
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre à jour le cache avec la nouvelle page
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // En cas d'échec réseau, essayer le cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si aucune page en cache, retourner la page offline
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Pour toutes les autres requêtes, stratégie Network-First
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Gestion des messages depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            console.log('[SW] Nettoyage cache:', name);
            return caches.delete(name);
          })
        );
      })
    );
  }
});

// Gestion des notifications push (pour futures fonctionnalités)
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const title = data.title || 'Dalil Tounes';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur une notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
