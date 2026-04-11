// Service Worker Registration
// Enregistre le service worker pour les fonctionnalités PWA

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[PWA] Service Worker enregistré avec succès:', registration.scope);

          // Vérifier les mises à jour toutes les heures
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Écouter les mises à jour du service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouveau service worker disponible
                  console.log('[PWA] Nouveau contenu disponible, rechargement requis');

                  // Optionnel : Afficher une notification à l'utilisateur
                  if (confirm('Une nouvelle version est disponible. Recharger maintenant ?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Échec de l\'enregistrement du Service Worker:', error);
        });

      // Recharger la page quand le nouveau service worker prend le contrôle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  } else {
    console.warn('[PWA] Service Worker non supporté par ce navigateur');
  }
}

// Fonction pour désinstaller le service worker (utile pour debug)
export function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistrations().then((registrations) => {
      return Promise.all(
        registrations.map((registration) => registration.unregister())
      ).then(() => {
        console.log('[PWA] Service Workers désinstallés');
        return true;
      });
    });
  }
  return Promise.resolve(false);
}

// Fonction pour nettoyer le cache
export function clearCache(): Promise<void> {
  if ('caches' in window) {
    return caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[PWA] Suppression du cache:', cacheName);
          return caches.delete(cacheName);
        })
      ).then(() => {
        console.log('[PWA] Tous les caches ont été supprimés');
      });
    });
  }
  return Promise.resolve();
}

// Fonction pour vérifier si l'app est installée
export function isAppInstalled(): boolean {
  // PWA installée si display-mode est standalone
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Fonction pour demander l'installation de la PWA
export function promptInstall(): Promise<void> {
  return new Promise((resolve, reject) => {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Empêcher le prompt par défaut
      e.preventDefault();
      deferredPrompt = e;
    });

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Installation acceptée');
          resolve();
        } else {
          console.log('[PWA] Installation refusée');
          reject(new Error('Installation refusée'));
        }
        deferredPrompt = null;
      });
    } else {
      reject(new Error('Prompt d\'installation non disponible'));
    }
  });
}
