/**
 * Helper de navigation compatible avec l'ancien système hash et le nouveau React Router
 *
 * Ce fichier fournit des utilitaires pour faciliter la migration progressive
 * de window.location.hash vers useNavigate()
 */

/**
 * Navigue vers une URL en enlevant le # si présent
 * Compatible avec les anciennes URLs en hash (#/page) et les nouvelles (/page)
 */
export function navigateTo(path: string): void {
  // Enlever le # si présent
  const cleanPath = path.startsWith('#') ? path.substring(1) : path;

  // Utiliser l'API History moderne
  window.history.pushState(null, '', cleanPath);

  // Déclencher un événement popstate pour que React Router détecte le changement
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Wrapper pour window.location.hash= qui utilise React Router
 * Pour compatibilité temporaire avec le code legacy
 *
 * @deprecated Utilisez useNavigate() à la place
 */
export function setLocationHash(hash: string): void {
  navigateTo(hash);
}

/**
 * Récupère les paramètres de query string depuis l'URL actuelle
 * Compatible avec hash routing et path routing
 */
export function getCurrentSearchParams(): URLSearchParams {
  // Essayer d'abord avec window.location.search (nouveau système)
  if (window.location.search) {
    return new URLSearchParams(window.location.search);
  }

  // Fallback sur hash (ancien système)
  const hash = window.location.hash;
  if (hash.includes('?')) {
    const queryString = hash.substring(hash.indexOf('?') + 1);
    return new URLSearchParams(queryString);
  }

  return new URLSearchParams();
}
