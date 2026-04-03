# Migration tags → badges_entreprise - Février 2026

**Date:** 2026-02-07
**Migration:** Remplacement de `tags` par `badges_entreprise` (text[])
**Statut:** ✅ Complété

---

## 🎯 Objectif

Migrer de la colonne obsolète `tags` vers la nouvelle colonne `badges_entreprise` (type `text[]` dans PostgreSQL) pour l'affichage et la recherche des badges d'entreprises.

---

## 📋 Changements Effectués

### 1. Interface Business (Businesses.tsx)

**Avant:**
```typescript
interface Business {
  // ...
  tags?: string[];
  // ...
}
```

**Après (propre et simplifié):**
```typescript
interface Business {
  // ...
  badges?: string[];  // Nom simplifié côté frontend
  // ...
}
```

**Note importante:** Dans la base de données, la colonne reste `badges_entreprise` (text[]), mais côté frontend on utilise le nom simplifié `badges` pour plus de clarté.

---

### 2. Requêtes Supabase (Businesses.tsx)

**Colonnes fetch:**
```typescript
// Avant
.select('..., tags, ...')

// Après
.select('..., badges_entreprise, ...')
```

**Mapping des données (transformation DB → Frontend):**
```typescript
// Avant
tags: item.tags || [],

// Après (badges_entreprise depuis DB → badges côté frontend)
badges: item.badges_entreprise || [],
```

**Architecture:**
- **Base de données:** Colonne `badges_entreprise` (text[])
- **Frontend:** Propriété `badges` (string[])
- **Mapping:** `badges: item.badges_entreprise || []`

---

### 3. Logique de Recherche (Businesses.tsx)

**Avant:**
```typescript
// Gérer le cas où tags est NULL ou un tableau vide
let matchTags = false;
if (Array.isArray(business.tags) && business.tags.length > 0) {
  matchTags = business.tags.some(tag =>
    normalizeText(tag || '').includes(normalizedSearchTerm)
  );
}
```

**Après (nom simplifié côté frontend):**
```typescript
// Gérer le cas où badges est NULL ou un tableau vide
let matchBadges = false;
if (Array.isArray(business.badges) && business.badges.length > 0) {
  matchBadges = business.badges.some(badge =>
    normalizeText(badge || '').includes(normalizedSearchTerm)
  );
}
```

**Recherche multi-colonnes:**
```typescript
const isMatch = matchNom || matchBadges || matchMotsCles || matchCategory || matchServices;
```

---

### 4. Composant BusinessCard

**Interface mise à jour (nom simplifié):**
```typescript
interface BusinessCardProps {
  business: {
    // ...
    badges?: string[];  // ← Nom simplifié
  };
}
```

**Affichage des badges:**
```typescript
{/* Badges */}
{business.badges && business.badges.length > 0 && (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px' }}>
    {business.badges.slice(0, 3).map((badge, index) => (
      <span
        key={index}
        style={{
          fontSize: '11px',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: cardStyle.isPremium ? 'rgba(212, 175, 55, 0.15)' : 'rgba(234, 88, 12, 0.08)',
          color: cardStyle.isPremium ? '#D4AF37' : '#EA580C',
          border: `1px solid ${cardStyle.isPremium ? 'rgba(212, 175, 55, 0.3)' : 'rgba(234, 88, 12, 0.15)'}`,
          // ...
        }}
      >
        {badge}
      </span>
    ))}
    {business.badges.length > 3 && (
      <span>+{business.badges.length - 3}</span>
    )}
  </div>
)}
```

**Caractéristiques:**
- ✅ Affiche jusqu'à 3 badges visibles
- ✅ Indicateur "+X" pour les badges supplémentaires
- ✅ Style adaptatif selon le statut d'abonnement (Premium/Standard)
- ✅ Badges dorés pour les comptes Premium
- ✅ Badges orange pour les comptes Standard

---

### 5. Page BusinessDetail

**Interface BusinessData:**
```typescript
// Avant
tags?: string;

// Après (nom simplifié)
badges?: string[];
```

**Mapping depuis DB:**
```typescript
const mappedBusiness = {
  ...data,
  statut_abonnement: (data['Statut Abonnement'] || '').trim().toLowerCase() || null,
  badges: data.badges_entreprise || []  // ← Transformation DB → Frontend
};
```

**Traductions mises à jour (5 langues):**
```typescript
// Français
badges: 'Badges',

// Anglais
badges: 'Badges',

// Arabe
badges: 'الكلمات المفتاحية',

// Italien
badges: 'Badge',

// Russe
badges: 'Теги',
```

**Affichage des badges:**
```typescript
// Avant (string avec split)
{business.tags && (
  <div className="mb-8">
    {business.tags.split(',').map((tag, idx) => (
      <span key={idx}>{tag.trim()}</span>
    ))}
  </div>
)}

// Après (tableau direct avec nom simplifié)
{business.badges && business.badges.length > 0 && (
  <div className="mb-8">
    {business.badges.map((badge, idx) => (
      <span key={idx}>{badge}</span>
    ))}
  </div>
)}
```

---

### 6. Composant BusinessSearchBar

**Texte d'aide mis à jour:**
```typescript
// Avant
placeholder="Recherche intelligente : nom, métier, tags, mots-clés..."
Recherche dans : Nom d'entreprise • Tags • Mots-clés • Catégories

// Après
placeholder="Recherche intelligente : nom, métier, badges, mots-clés..."
Recherche dans : Nom d'entreprise • Badges • Mots-clés • Catégories
```

---

### 7. BusinessList.tsx (Commentaires TODO)

```typescript
// Avant
* - Filtres par services / tags

// Après
* - Filtres par services / badges
```

---

## 🔍 Colonnes de Recherche Actives

La recherche multi-colonnes fonctionne maintenant sur **5 colonnes** :

1. ✅ **nom** - Nom de l'entreprise
2. ✅ **badges** - Badges d'entreprise (depuis badges_entreprise en DB)
3. ✅ **mots_cles_recherche** - Mots-clés optimisés
4. ✅ **sous_categories** - Catégorie métier
5. ✅ **services** - Liste des services

**Note:** La recherche utilise `business.badges` côté frontend, qui est mappé depuis `badges_entreprise` dans la base de données.

---

## 🎨 Styles des Badges

### Badges Premium (Elite/Premium/Artisan)
- **Fond:** `rgba(212, 175, 55, 0.15)` (doré transparent)
- **Texte:** `#D4AF37` (doré)
- **Bordure:** `rgba(212, 175, 55, 0.3)` (doré semi-transparent)

### Badges Standard (Découverte)
- **Fond:** `rgba(234, 88, 12, 0.08)` (orange transparent)
- **Texte:** `#EA580C` (orange)
- **Bordure:** `rgba(234, 88, 12, 0.15)` (orange semi-transparent)

### Affichage
- **Maximum visible:** 3 badges
- **Indicateur surplus:** "+X" pour badges supplémentaires
- **Taille texte:** 11px
- **Padding:** 4px 10px
- **Border-radius:** 6px
- **Max-width:** 120px avec ellipsis

---

## 🔒 Sécurité et Robustesse

### Protection contre null/undefined
```typescript
// Vérification du tableau côté frontend
if (Array.isArray(business.badges) && business.badges.length > 0) {
  // Traitement avec protection badge individuel
  business.badges.some(badge =>
    normalizeText(badge || '').includes(normalizedSearchTerm)
  );
}
```

### Valeurs par défaut dans le mapping
```typescript
// Mapping DB → Frontend avec valeur par défaut
badges: item.badges_entreprise || [],  // ← Protection contre null/undefined
```

---

## 📊 Résultats des Tests

### Build
```bash
✓ 2070 modules transformed
✓ built in 15.73s
✅ Aucune erreur TypeScript
✅ Aucune erreur de compilation
```

### Tests Fonctionnels
1. ✅ Fetch des badges depuis Supabase
2. ✅ Affichage des badges sur les cartes
3. ✅ Recherche par badges fonctionnelle
4. ✅ Affichage détail entreprise avec badges
5. ✅ Protection contre valeurs null/undefined
6. ✅ Styles adaptatifs Premium/Standard
7. ✅ Traductions multi-langues

---

## 📝 Fichiers Modifiés

| Fichier | Type de Modification | Description |
|---------|---------------------|-------------|
| `src/pages/Businesses.tsx` | ✅ Major | Interface, fetch, mapping, recherche |
| `src/components/BusinessCard.tsx` | ✅ Major | Interface, affichage badges |
| `src/pages/BusinessDetail.tsx` | ✅ Major | Interface, affichage, traductions |
| `src/components/BusinessSearchBar.tsx` | ✅ Minor | Textes d'aide |
| `src/pages/BusinessList.tsx` | ✅ Minor | Commentaires TODO |

---

## ✅ Checklist de Validation

- [x] Interface Business mise à jour (tags → badges)
- [x] Fetch Supabase mis à jour (badges_entreprise depuis DB)
- [x] Mapping DB → Frontend corrigé (badges_entreprise → badges)
- [x] Logique de recherche mise à jour (business.badges)
- [x] BusinessCard affiche les badges
- [x] BusinessDetail affiche les badges avec mapping
- [x] Traductions mises à jour (5 langues)
- [x] BusinessSearchBar mis à jour
- [x] Commentaires TODO corrigés
- [x] Protection null/undefined
- [x] Styles adaptatifs Premium/Standard
- [x] Architecture de mapping DB → Frontend
- [x] Build sans erreurs
- [x] Tests fonctionnels OK

---

## 🚀 Avantages de la Migration

### Avant (tags)
- ❌ Nom peu descriptif
- ❌ Confusion avec d'autres "tags" du système
- ❌ Pas de distinction claire avec mots_cles_recherche

### Après (badges_entreprise → badges)
- ✅ **Base de données:** Nom explicite `badges_entreprise` (text[])
- ✅ **Frontend:** Nom simplifié `badges` pour code plus propre
- ✅ Distinction claire : badges visuels vs mots-clés SEO
- ✅ Type PostgreSQL natif (text[])
- ✅ Affichage visuel amélioré sur les cartes
- ✅ Recherche intégrée et performante
- ✅ Styles adaptatifs par abonnement
- ✅ Architecture claire DB → Frontend

---

## 🏗️ Architecture de Mapping

```
┌─────────────────────┐
│   Base de Données   │
│   (Supabase)        │
│                     │
│  badges_entreprise  │ ← Colonne PostgreSQL (text[])
│  (type: text[])     │
└──────────┬──────────┘
           │
           │ Fetch via .select('badges_entreprise, ...')
           │
           ▼
┌─────────────────────┐
│   Mapping Layer     │
│                     │
│  badges: item.      │
│  badges_entreprise  │
│  || []              │
└──────────┬──────────┘
           │
           │ Transformation propre
           │
           ▼
┌─────────────────────┐
│   Frontend State    │
│   (Interface)       │
│                     │
│  badges?: string[]  │ ← Propriété simplifiée
└─────────────────────┘
           │
           │ Utilisation dans composants
           │
           ▼
┌─────────────────────┐
│   UI Components     │
│                     │
│  business.badges    │ ← Affichage et recherche
│  .map((badge) =>    │
│    <span>...)       │
└─────────────────────┘
```

### Avantages du Mapping

1. **Code Frontend Plus Propre**
   - `business.badges` au lieu de `business.badges_entreprise`
   - Nom plus court et plus naturel

2. **Séparation des Responsabilités**
   - La DB garde son nom explicite `badges_entreprise`
   - Le frontend utilise un nom simplifié `badges`

3. **Facilité de Maintenance**
   - Un seul point de transformation (mapping)
   - Changements DB n'impactent pas directement l'UI

4. **Cohérence du Code**
   - Tous les composants utilisent `business.badges`
   - Pas de mélange entre différents noms

---

## 📚 Documentation

### Utilisation dans le code

**1. Fetch depuis Supabase:**
```typescript
const { data } = await supabase
  .from('entreprise')
  .select('id, nom, badges_entreprise, ...')  // ← Nom DB
```

**2. Mapping DB → Frontend:**
```typescript
const mappedData = data.map(item => ({
  ...item,
  badges: item.badges_entreprise || []  // ← Transformation
}));
```

**3. Afficher les badges dans un composant:**
```typescript
{business.badges && business.badges.length > 0 && (
  <div>
    {business.badges.map((badge, index) => (
      <span key={index}>{badge}</span>
    ))}
  </div>
)}
```

**4. Rechercher dans les badges:**
```typescript
const matchBadges = Array.isArray(business.badges)
  ? business.badges.some(badge =>
      normalizeText(badge || '').includes(searchTerm)
    )
  : false;
```

---

**Migration complétée avec succès !** ✅

Les badges d'entreprise sont maintenant affichés, recherchables et stylisés de manière professionnelle.
