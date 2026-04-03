# Intégration Recherche Accueil → Page Entreprises

## Vue d'ensemble

La page d'accueil est maintenant connectée à la page Entreprises. Quand un utilisateur effectue une recherche sur l'accueil, il est automatiquement redirigé vers la page Entreprises avec tous les filtres appliqués.

## Architecture

### 1. Normalisation de Texte

Un nouveau module `src/lib/textNormalization.ts` centralise la logique de normalisation :

```typescript
export function normalizeText(text: string): string {
  return removeAccents(text.toLowerCase().trim());
}
```

Cette fonction :
- Supprime les accents (café → cafe)
- Convertit en minuscules
- Supprime les espaces superflus

**Utilisé dans** : recherche d'emplois, recherche d'entreprises, recherche générale

### 2. Transfert de Paramètres URL

**SearchBar.tsx** utilise la fonction `buildEntrepriseUrl()` pour créer des URLs avec paramètres :

```typescript
const url = buildEntrepriseUrl({
  q: query || undefined,
  ville: villeParam || undefined,
  categorie: detectedCategory
});
// Résultat: #/entreprises?q=restaurant&ville=Tunis
```

### 3. Lecture des Paramètres URL

**Businesses.tsx** lit automatiquement les paramètres au chargement :

```typescript
useEffect(() => {
  const loadUrlParams = () => {
    const params = readParams();
    setSearchTerm(params.q || '');
    setSelectedCity(params.ville || '');
    setSelectedCategory(params.categorie || '');
    setFilterPremium(hashParams.get('premium') === 'true');
  };

  loadUrlParams();

  // Écoute les changements d'URL
  window.addEventListener('hashchange', handleHashChange);
}, []);
```

### 4. Déclenchement Automatique de la Recherche

Un `useEffect` surveille les changements de filtres :

```typescript
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (searchTerm || selectedCity || selectedCategory || filterPremium) {
      performSearch(); // Lance la recherche
    } else {
      fetchBusinesses(); // Charge toutes les entreprises
    }
  }, 250);

  return () => clearTimeout(delayDebounceFn);
}, [searchTerm, selectedCity, selectedCategory, filterPremium]);
```

## Flux de Navigation

### Depuis l'Accueil

1. **Utilisateur tape une recherche** dans SearchBar
2. **SearchBar.onSubmit** construit l'URL avec les paramètres
3. **Navigation** vers `#/entreprises?q=...&ville=...`
4. **Businesses.tsx** lit les paramètres
5. **Mise à jour des states** (searchTerm, selectedCity, etc.)
6. **useEffect** détecte les changements
7. **performSearch()** est appelé automatiquement
8. **Résultats affichés** avec les filtres appliqués

### Bouton "Voir tous les établissements premium"

Le bouton dans `PremiumPartnersSection` redirige vers :

```
#/entreprises?premium=true
```

Ce qui active automatiquement le filtre premium.

## Paramètres URL Supportés

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `q` | Mot-clé de recherche | `?q=restaurant` |
| `ville` | Gouvernorat | `?ville=Tunis` |
| `categorie` | Catégorie d'entreprise | `?categorie=restauration` |
| `premium` | Filtre entreprises premium | `?premium=true` |
| `page_categorie` | Page de catégorie spécifique | `?page_categorie=sante` |
| `selected_id` | ID entreprise présélectionnée | `?selected_id=abc-123` |

## Bouton "Réinitialiser"

Le bouton "Réinitialiser la recherche" :

```typescript
onClick={() => {
  setSearchTerm('');
  setSelectedCity('');
  setSelectedCategory('');
  setPageCategorie(null);
  setFilterPremium(false);
  window.location.hash = '#/entreprises'; // Supprime les paramètres URL
}}
```

## Cohérence avec la Recherche Emploi

Le même système de normalisation est utilisé pour :

- **Emplois** : `src/hooks/useSimpleJobSearch.ts`
- **Entreprises** : `src/pages/Businesses.tsx`
- **Recherche générale** : `src/components/SearchBar.tsx`

Cela garantit que les recherches avec accents fonctionnent partout de la même manière.

## Exemples d'Utilisation

### Exemple 1 : Recherche simple
```
Utilisateur tape "café" → #/entreprises?q=café
→ Recherche "cafe" (sans accent) dans la base
```

### Exemple 2 : Recherche avec ville
```
Utilisateur tape "restaurant" + sélectionne "Tunis"
→ #/entreprises?q=restaurant&ville=Tunis
→ Filtre par mot-clé ET ville
```

### Exemple 3 : Voir les établissements premium
```
Clic sur "Voir tous nos établissements premium"
→ #/entreprises?premium=true
→ Affiche uniquement les entreprises avec is_premium=true
```

## Avantages

1. **URLs partageables** : Les utilisateurs peuvent copier/coller l'URL de recherche
2. **Navigation arrière** : Le bouton précédent du navigateur fonctionne correctement
3. **Bookmarkable** : Possibilité de mettre en favoris une recherche
4. **Deep linking** : On peut créer des liens directs vers des recherches spécifiques
5. **État persistant** : Rafraîchir la page conserve les filtres

## Notes Techniques

- **Debounce de 250ms** : Évite les requêtes excessives lors de la frappe
- **Cache des résultats** : SearchBar utilise un cache pour éviter les requêtes répétées
- **Listener hashchange** : Détecte les changements d'URL pour recharger les paramètres
- **Fallback intelligent** : Si aucun paramètre, charge toutes les entreprises

## Maintenance Future

Pour ajouter un nouveau paramètre de recherche :

1. Ajouter le paramètre dans `buildEntrepriseUrl()` (url.ts)
2. Lire le paramètre dans `loadUrlParams()` (Businesses.tsx)
3. Créer le state correspondant
4. Ajouter le state dans le useEffect de recherche
5. Mettre à jour `performSearch()` pour utiliser le nouveau filtre
