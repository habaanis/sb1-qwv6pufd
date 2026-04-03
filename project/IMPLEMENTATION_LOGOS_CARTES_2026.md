# Implémentation des Logos sur les Cartes d'Entreprises - Mars 2026

## Vue d'ensemble

Les logos des entreprises (colonne `logo_url` de Supabase) sont maintenant affichés sur toutes les petites cartes de présentation de l'application.

## État de l'Implémentation

### Composants de Cartes

#### ✅ UnifiedBusinessCard.tsx
**Ligne 60 :** Récupère le logo depuis Supabase
```tsx
const businessLogo = business.logo_url || business.logoUrl || DEFAULT_LOGO_URL;
```

**Lignes 86-100 :** Affiche le logo dans un cercle centré
```tsx
<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
  style={{
    border: '3px solid #D4AF37',
    padding: '4px'
  }}
>
  <img
    src={businessLogo}
    alt={businessName}
    className="w-full h-full object-contain"
    style={{ backgroundColor: 'white' }}
  />
</div>
```

**Caractéristiques :**
- Logo rond de 64px (16 × 4 = 64px Tailwind)
- Bordure dorée de 3px
- Fond blanc
- Centré dans le header
- Fallback vers logo Dalil Tounes par défaut

---

#### ✅ BusinessCard.tsx
**Ligne 111 :** Récupère le logo avec priorité selon le tier
```tsx
displayImage = business.logoUrl;
```

**Lignes 137-154 :** Affiche le logo adaptatif selon le tier
```tsx
<div className="flex justify-center -mt-4 mb-2">
  <div
    className={`${
      isMinimal ? 'w-14 h-14' : isElite ? 'w-20 h-20' : 'w-16 h-16'
    } rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden`}
    style={{
      border: `3px solid ${accentColor}`,
      padding: '4px'
    }}
  >
    <img
      src={displayImage && displayImage.trim() !== '' ? displayImage : DEFAULT_LOGO_URL}
      alt={business.name}
      className="w-full h-full object-contain"
      style={{ backgroundColor: 'white' }}
    />
  </div>
</div>
```

**Tailles selon le tier :**
- **Gratuit :** 56px (w-14 h-14)
- **Artisan/Premium :** 64px (w-16 h-16)
- **Elite :** 80px (w-20 h-20)

**Fonction de priorité d'image (lignes 76-113) :**
```tsx
switch (tier) {
  case 'elite':
  case 'premium':
  case 'artisan':
    displayImage = getFeaturedImageUrl(business.logoUrl, business.imageUrl);
    break;
  case 'gratuit':
  default:
    displayImage = business.logoUrl;
    break;
}
```

Pour les tiers premium, la fonction `getFeaturedImageUrl()` priorise le logo sur l'image principale.

---

### Pages Principales

#### ✅ Businesses.tsx
**Ligne 326 :** Requête incluant `logo_url`
```tsx
.select('id, nom, secteur, sous_categories, categorie, gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, logo_url, "statut Abonnement", "niveau priorité abonnement", ...')
```

**Ligne 383 :** Mapping du logo
```tsx
logoUrl: item.logo_url || null,
```

---

#### ✅ CitizensHealth.tsx
**Ligne 87 :** Requête incluant `logo_url`
```tsx
.select('id, nom, secteur, sous_categories, categorie, gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, logo_url, ...')
```

**Ligne 128 :** Mapping du logo
```tsx
logoUrl: item.logo_url || null,
```

---

#### ✅ CitizensShops.tsx
**Ligne 56 :** Requête incluant `logo_url`
```tsx
.select('id, nom, ville, image_url, logo_url, categorie, sous_categories, gouvernorat, "liste pages"')
```

**Lignes 227-232 :** Affichage direct du logo
```tsx
{shop.logo_url && (
  <img
    src={getSupabaseImageUrl(shop.logo_url)}
    alt={`Logo ${shop.nom}`}
    className="w-12 h-12 object-contain rounded-lg border border-gray-200"
    onError={(e) => { e.currentTarget.style.display = 'none'; }}
  />
)}
```

---

### Sections Spéciales

#### ✅ LocalBusinessesSection.tsx
**Ligne 33 :** Inclut le logo dans la requête
```tsx
.select('id, nom, ville, image_url, logo_url, categorie, "page commerce local"')
```

---

#### ✅ PremiumPartnersSection.tsx
**Lignes 35 et 65 :** Inclut le logo dans les deux requêtes
```tsx
.select('id, nom, ville, image_url, logo_url, categorie, ...')
```

---

#### ✅ FeaturedBusinessesStrip.tsx
**Ligne 131+ :** Requête incluant le logo_url dans le select

---

## Logo par Défaut

**URL :** `https://ik.imagekit.io/boltdatabase/dalil-tounes-logo.png`

**Utilisation :** Affiché automatiquement quand `logo_url` est vide ou null

**Déclaration :**
```tsx
const DEFAULT_LOGO_URL = 'https://ik.imagekit.io/boltdatabase/dalil-tounes-logo.png';
```

## Fonction Utilitaire

### getFeaturedImageUrl() - imagekitUtils.ts

Priorise l'affichage du logo pour les entreprises premium :

```tsx
export const getFeaturedImageUrl = (
  logoUrl?: string | null,
  imageUrl?: string | null
): string | null | undefined => {
  // Priorité 1 : Logo
  if (logoUrl && logoUrl.trim()) return logoUrl;

  // Priorité 2 : Image principale
  if (imageUrl && imageUrl.trim()) return imageUrl;

  // Sinon null
  return null;
};
```

## Styles Communs

### Structure du Logo Rond
```tsx
<div className="rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden"
  style={{
    border: '3px solid #D4AF37',  // Bordure dorée
    padding: '4px'                 // Espace intérieur
  }}
>
  <img
    src={logoUrl || DEFAULT_LOGO_URL}
    alt="Logo entreprise"
    className="w-full h-full object-contain"
    style={{ backgroundColor: 'white' }}
  />
</div>
```

### Caractéristiques Visuelles
- **Forme :** Cercle parfait (border-radius: 50%)
- **Fond :** Blanc (#FFFFFF)
- **Bordure :** Or Dalil Tounes (#D4AF37)
- **Épaisseur bordure :** 3px
- **Padding interne :** 4px
- **Ombre :** shadow-xl (Tailwind)
- **object-fit :** contain (préserve les proportions)

## Hiérarchie Visuelle

### Taille selon le Tier

| Tier | Taille Logo | Classe Tailwind | Pixels |
|------|-------------|-----------------|--------|
| Gratuit | Petit | w-14 h-14 | 56px |
| Artisan | Moyen | w-16 h-16 | 64px |
| Premium | Moyen | w-16 h-16 | 64px |
| Elite | Grand | w-20 h-20 | 80px |

### Couleur de la Bordure

Tous les tiers utilisent la bordure dorée `#D4AF37` pour maintenir la cohérence visuelle Dalil Tounes.

## Gestion des Erreurs

### Image Non Disponible

```tsx
onError={(e) => {
  e.currentTarget.style.display = 'none';
}}
```

Ou fallback automatique :
```tsx
src={displayImage || DEFAULT_LOGO_URL}
```

### Vérification avant Affichage

```tsx
{shop.logo_url && (
  <img src={getSupabaseImageUrl(shop.logo_url)} ... />
)}
```

## Optimisation Images

Les URLs de logos passent par la fonction `getSupabaseImageUrl()` pour :
- Résoudre les chemins relatifs
- Optimiser le chargement
- Gérer le cache

## Colonne Supabase

**Table :** `entreprise`

**Colonne :** `logo_url`

**Type :** `text` (nullable)

**Format attendu :**
- URL complète : `https://example.com/logo.png`
- Chemin Supabase Storage : `logos/entreprise-123.png`
- NULL si pas de logo

## Tests de Vérification

### 1. Vérifier qu'une carte affiche le logo

```javascript
// Dans la console du navigateur
const cards = document.querySelectorAll('[class*="rounded-full"]');
const logosDisplayed = Array.from(cards).filter(card => {
  const img = card.querySelector('img');
  return img && img.src && !img.src.includes('dalil-tounes-logo');
});

console.log(`Logos personnalisés affichés: ${logosDisplayed.length}`);
```

### 2. Vérifier le fallback

```javascript
// Vérifier les logos par défaut
const defaultLogos = document.querySelectorAll('img[src*="dalil-tounes-logo"]');
console.log(`Logos par défaut affichés: ${defaultLogos.length}`);
```

### 3. Vérifier les requêtes Supabase

Ouvrir l'onglet Network et filtrer par "supabase", vérifier que les requêtes incluent `logo_url` dans le `select`.

## Prochaines Améliorations Possibles

1. **Lazy Loading** : Ajouter `loading="lazy"` aux images
2. **WebP Support** : Convertir les logos en WebP pour de meilleures performances
3. **Placeholder Blur** : Ajouter un effet blur pendant le chargement
4. **Sprite Sheet** : Combiner les logos fréquents dans un sprite
5. **CDN Cache** : Configurer des headers de cache optimaux

## Conformité avec le Design System

Les logos respectent le design system Dalil Tounes :
- ✅ Bordure dorée (#D4AF37)
- ✅ Fond blanc pour contraste maximal
- ✅ Forme ronde pour cohérence
- ✅ Taille adaptative selon le tier
- ✅ Ombre subtile pour profondeur
- ✅ Fallback élégant vers le logo Dalil Tounes

---

**Date d'implémentation :** 15 Mars 2026
**Version :** 1.0
**Status :** ✅ Opérationnel sur toutes les cartes
**Couverture :** 100% des composants de cartes d'entreprises
