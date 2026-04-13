export const SEARCH_BARS_ENABLED = {
  navbar: false,
  home: true,
  categories: {
    sante: true,
    education: true,
    administration: true,
    loisirs: true,
    magasin: true,
    marche_local: true,
  },
} as const;

const DISABLE_SECONDARY = import.meta.env.VITE_DISABLE_SECONDARY_SEARCH === '1';

export function isSearchBarAllowed(place: 'navbar' | 'home' | 'category', scope?: string): boolean {
  if (DISABLE_SECONDARY && place !== 'navbar' && place !== 'home') return false;

  if (place === 'navbar') return SEARCH_BARS_ENABLED.navbar;
  if (place === 'home') return SEARCH_BARS_ENABLED.home;
  if (place === 'category' && scope) {
    return !!(SEARCH_BARS_ENABLED.categories as Record<string, boolean>)[scope];
  }
  return false;
}
