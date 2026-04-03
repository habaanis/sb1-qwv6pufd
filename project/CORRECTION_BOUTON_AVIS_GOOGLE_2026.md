# Correction - Bouton "Voir les avis sur Google"

**Date**: 8 février 2026
**Composant**: `BusinessDetail.tsx`
**Problème**: Le bouton utilisait une mauvaise colonne de la base de données

---

## Problème Identifié

Le bouton "Voir les avis sur Google" ne fonctionnait pas correctement car il utilisait la colonne `google_url` au lieu de la colonne `Lien Avis Google` qui contient le lien direct vers les avis Google.

### Comportement Avant

```typescript
// ❌ Ancienne implémentation (INCORRECTE)
{business.google_url && (
  <a href={business.google_url}>
    Voir les avis sur Google
  </a>
)}
```

**Problème** :
- `google_url` contient le lien vers Google Maps (pas les avis)
- `Lien Avis Google` contient le vrai lien vers les avis mais n'était pas utilisé
- Le bouton ne menait pas à la bonne destination

### Exemple avec CH Store

**Données dans Supabase** :
- `google_url` = `https://www.google.com/maps/place/Ch+store/...` (Google Maps)
- `Lien Avis Google` = `https://www.google.com/search?...&tbm=lcl#lkt=LocalPoiReviews` (Avis Google)

---

## Solution Appliquée

### 1. Ajout de la colonne dans l'interface TypeScript

```typescript
interface Business {
  // ... autres propriétés
  google_url?: string;           // Garde pour Google Maps
  'Lien Avis Google'?: string;   // ✅ Ajouté pour les avis
}
```

### 2. Correction du bouton

```typescript
// ✅ Nouvelle implémentation (CORRECTE)
{business['Lien Avis Google'] && (
  <a
    href={business['Lien Avis Google']}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
  >
    <Star size={20} className="fill-yellow-300 text-yellow-300" />
    {text.googleReviews}
  </a>
)}
```

### 3. Condition d'affichage corrigée

```typescript
// Avant
{(business.google_url || business.Maps_url) && (
  // ...
)}

// Après
{(business['Lien Avis Google'] || business.Maps_url) && (
  // ...
)}
```

---

## Résultat

### ✅ Comportement Après Correction

1. **Bouton "Voir les avis sur Google"** :
   - Utilise directement `business['Lien Avis Google']`
   - Ouvre l'URL exacte saisie dans Supabase
   - Ne génère AUCUNE recherche automatique
   - Amène directement à la page des avis Google

2. **Bouton "Voir sur Maps"** :
   - Utilise `business.Maps_url`
   - Reste inchangé
   - Fonctionne correctement

### Distinction Claire

| Bouton | Colonne Supabase | Usage |
|--------|------------------|-------|
| **Voir les avis sur Google** | `Lien Avis Google` | Lien direct vers les avis Google Reviews |
| **Voir sur Maps** | `Maps_url` | Lien vers Google Maps (localisation) |

---

## Vérification

### Test avec CH Store

**Avant** :
- Clic sur "Voir les avis sur Google" → Redirigeait vers Google Maps

**Après** :
- Clic sur "Voir les avis sur Google" → Redirige vers `https://www.google.com/search?...#lkt=LocalPoiReviews` (avis)
- Clic sur "Voir sur Maps" → Redirige vers Google Maps (localisation)

---

## Points Clés

### ✅ Priorité à la Donnée Brute

Le système utilise maintenant **exactement** l'URL stockée dans la colonne `Lien Avis Google` sans aucune transformation ni génération automatique.

### ✅ Pas de Génération Automatique

Aucune URL n'est générée automatiquement. Le système utilise uniquement les URLs saisies manuellement dans Supabase.

### ✅ Distinction Claire

- **Avis Google** → Colonne `Lien Avis Google`
- **Maps** → Colonne `Maps_url`
- **Maps (alternatif)** → Colonne `google_url`

---

## Fichiers Modifiés

- `/src/pages/BusinessDetail.tsx`
  - Ligne 58 : Ajout de `'Lien Avis Google'?: string;` dans l'interface
  - Ligne 481 : Condition corrigée
  - Ligne 483-493 : Bouton corrigé pour utiliser `business['Lien Avis Google']`

---

## Build & Tests

✅ Build réussi sans erreur TypeScript
✅ Toutes les colonnes avec espaces et caractères spéciaux sont correctement gérées
✅ Le bouton s'affiche uniquement si la colonne `Lien Avis Google` contient une valeur

---

## Note Importante

La colonne `google_url` n'est **pas supprimée** car elle peut servir d'alternative ou de lien vers la fiche Google Maps principale. Seule la priorité du bouton "Voir les avis sur Google" a été corrigée pour utiliser la bonne colonne.
