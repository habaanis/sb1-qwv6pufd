# Uniformisation des Cartes Entreprises - 2026-02-07

## Contexte

Uniformisation du visuel des cartes d'entreprises sur tout le site Dalil Tounes pour garantir une expérience cohérente.

---

## État des Lieux

### Composants Existants

Le site utilise **2 composants de cartes** pour afficher les entreprises :

1. **BusinessCard** (`src/components/BusinessCard.tsx`)
   - Utilisé dans : `Home.tsx` (via FeaturedBusinessesStrip) et `Businesses.tsx`
   - Fonction : `getBusinessStyle()` qui applique les couleurs selon le statut

2. **SignatureCard** (`src/components/SignatureCard.tsx`)
   - Utilisé dans : `BusinessDirectory.tsx` (pour BusinessList.tsx et PartnerDirectory.tsx)
   - Fonction : `getTierStyles()` qui applique les couleurs selon le tier

---

## Système de Couleurs Unifié

### Palette par Statut d'Abonnement

| Statut | Couleur de fond | Code couleur | Bordure |
|--------|-----------------|--------------|---------|
| **Elite** | Noir | `#121212` | Or `#D4AF37` (2px) |
| **Premium** | Vert foncé | `#064E3B` | Or `#D4AF37` (2px) |
| **Artisan** | Mauve | `#4A1D43` | Or `#D4AF37` (2px) |
| **Découverte** | Blanc | `#FFFFFF` | Or `#D4AF37` (2px) |

### Caractéristiques Communes

- **Bordure dorée** : Tous les statuts ont une bordure `#D4AF37` de `2px solid`
- **Ombre portée Premium** : Les statuts Elite/Premium/Artisan ont une ombre dorée :
  ```css
  box-shadow: 0 8px 32px rgba(212,175,55,0.15), 0 0 40px rgba(212,175,55,0.08)
  ```
- **Ombre portée Découverte** :
  ```css
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  ```

---

## Modifications Apportées

### 1. Uniformisation de la Couleur "Découverte"

**Fichier** : `src/components/SignatureCard.tsx`

**Avant** (ligne 26) :
```typescript
backgroundColor: '#F8FAFC', // Gris très clair
```

**Après** (ligne 26) :
```typescript
backgroundColor: '#FFFFFF', // Blanc pur
```

**Raison** : Aligner avec BusinessCard pour une cohérence totale.

---

## Vérification par Page

### Page d'Accueil (`Home.tsx`)

**Composant utilisé** : `BusinessCard` (via `FeaturedBusinessesStrip`)

**Code** :
```tsx
<BusinessCard
  business={{
    id: business.id,
    name: business.name,
    category: business.category,
    gouvernorat: business.city,
    statut_abonnement: business.statutAbonnement
  }}
  onClick={() => {
    window.location.hash = `#/business/${business.id}`;
  }}
/>
```

**Couleurs appliquées** : ✅ Via `getBusinessStyle()`
- Artisan : Mauve `#4A1D43`
- Premium : Vert `#064E3B`
- Elite : Noir `#121212`
- Découverte : Blanc `#FFFFFF`

---

### Page Entreprises (`Businesses.tsx`)

**Composant utilisé** : `BusinessCard`

**Code** (ligne 1074-1084) :
```tsx
<BusinessCard
  key={`${business.id}-${business.statut_abonnement || 'default'}`}
  business={{
    id: business.id,
    name: business.name,
    category: business.category,
    gouvernorat: business.gouvernorat,
    statut_abonnement: business.statut_abonnement
  }}
  onClick={() => setSelectedBusiness(business)}
/>
```

**Couleurs appliquées** : ✅ Via `getBusinessStyle()`
- Artisan : Mauve `#4A1D43`
- Premium : Vert `#064E3B`
- Elite : Noir `#121212`
- Découverte : Blanc `#FFFFFF`

**Bordure dorée** : ✅ 2px `#D4AF37` pour tous

---

### Annuaire Entreprises (`BusinessDirectory.tsx`)

**Composant utilisé** : `SignatureCard`

**Code** (ligne 307-428) :
```tsx
<SignatureCard
  key={business.id}
  tier={tier}
  className="p-6"
>
  {/* Contenu de la carte */}
</SignatureCard>
```

**Couleurs appliquées** : ✅ Via `getTierStyles()`
- Artisan : Mauve `#4A1D43`
- Premium : Vert `#064E3B`
- Elite : Noir `#121212`
- Découverte : Blanc `#FFFFFF` (après correction)

**Bordure dorée** : ✅ 2px `#D4AF37` pour tous

---

## Logique de Mapping des Couleurs

### Dans BusinessCard

**Fonction** : `getBusinessStyle()`

```typescript
const getBusinessStyle = () => {
  const statut = (business.statut_abonnement || '').toLowerCase();

  if (statut.includes('artisan')) {
    return {
      backgroundColor: '#4A1D43',
      color: '#FFFFFF',
      borderColor: '#D4AF37',
      isPremium: true
    };
  } else if (statut.includes('premium')) {
    return {
      backgroundColor: '#064E3B',
      color: '#FFFFFF',
      borderColor: '#D4AF37',
      isPremium: true
    };
  } else if (statut.includes('elite')) {
    return {
      backgroundColor: '#121212',
      color: '#FFFFFF',
      borderColor: '#D4AF37',
      isPremium: true
    };
  } else {
    return {
      backgroundColor: '#FFFFFF',
      color: '#1A1A1A',
      borderColor: '#D4AF37',
      isPremium: false
    };
  }
};
```

**Fonctionnement** :
- Analyse `business.statut_abonnement` (colonne `"Statut Abonnement"` de la DB)
- Convertit en minuscules
- Vérifie la présence de mots-clés : `'artisan'`, `'premium'`, `'elite'`
- Applique les couleurs correspondantes

---

### Dans SignatureCard

**Fonction** : `getTierStyles()`

```typescript
const getTierStyles = () => {
  if (tier) {
    switch (tier) {
      case 'decouverte':
        return {
          backgroundColor: '#FFFFFF', // ← Corrigé
          borderColor: '#D4AF37',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        };
      case 'artisan':
        return {
          backgroundColor: '#4A1D43',
          borderColor: '#D4AF37',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 8px 32px rgba(212,175,55,0.15), 0 0 40px rgba(212,175,55,0.08)'
        };
      case 'premium':
        return {
          backgroundColor: '#064E3B',
          borderColor: '#D4AF37',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 8px 32px rgba(212,175,55,0.15), 0 0 40px rgba(212,175,55,0.08)'
        };
      case 'elite':
        return {
          backgroundColor: '#121212',
          borderColor: '#D4AF37',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 8px 32px rgba(212,175,55,0.15), 0 0 40px rgba(212,175,55,0.08)'
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          borderColor: '#D4AF37',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        };
    }
  }
  // ...
};
```

**Fonctionnement** :
- Reçoit un prop `tier` : `'decouverte' | 'artisan' | 'premium' | 'elite' | 'custom'`
- Applique les styles correspondants via un `switch`
- Le tier est calculé avant l'appel au composant via `mapSubscriptionToTier()`

---

## Helpers de Mapping

### `mapSubscriptionToTier()`

**Fichier** : `src/lib/subscriptionTiers.ts`

**Fonction** :
```typescript
export function mapSubscriptionToTier(business: {
  statut_abonnement?: string | null;
  is_premium?: boolean;
}): SubscriptionTier {
  const statut = (business.statut_abonnement || '').toLowerCase();

  if (statut.includes('elite')) return 'elite';
  if (statut.includes('premium')) return 'premium';
  if (statut.includes('artisan')) return 'artisan';
  return 'decouverte';
}
```

**Utilisation** :
```typescript
const tier = mapSubscriptionToTier({
  statut_abonnement: business.statut_abonnement,
  is_premium: business.is_premium
});
```

---

## Effet Visuel Premium

Les cartes Elite, Premium et Artisan bénéficient d'un **effet de brillance au survol** :

**Code** (dans `SignatureCard.tsx`) :
```tsx
{showShineEffect && (
  <>
    <div
      className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
        animation: 'shine 1.5s ease-in-out',
        transform: 'translateX(-100%)',
      }}
    />
    <style>{`
      @keyframes shine {
        0% { transform: translateX(-100%) skewX(-15deg); }
        100% { transform: translateX(200%) skewX(-15deg); }
      }
      .group:hover > div:first-child {
        animation: shine 1.5s ease-in-out;
      }
    `}</style>
  </>
)}
```

**Résultat** : Un éclair blanc traverse la carte de gauche à droite au survol.

---

## Détails Visuels par Statut

### 🟣 Artisan (Mauve)

- **Fond** : `#4A1D43` (Mauve profond)
- **Texte** : Blanc `#FFFFFF`
- **Icône fond** : `#5A2D53` (Mauve plus clair)
- **Icône couleur** : Or `#D4AF37`
- **Bordure** : Or `#D4AF37` (2px)
- **Ombre** : Dorée diffuse

### 🟢 Premium (Vert)

- **Fond** : `#064E3B` (Vert forêt foncé)
- **Texte** : Blanc `#FFFFFF`
- **Icône fond** : `#065F46` (Vert plus clair)
- **Icône couleur** : Or `#D4AF37`
- **Bordure** : Or `#D4AF37` (2px)
- **Ombre** : Dorée diffuse

### ⚫ Elite (Noir)

- **Fond** : `#121212` (Noir profond)
- **Texte** : Blanc `#FFFFFF`
- **Icône fond** : `#1E1E1E` (Gris très foncé)
- **Icône couleur** : Or `#D4AF37`
- **Bordure** : Or `#D4AF37` (2px)
- **Ombre** : Dorée diffuse

### ⚪ Découverte (Blanc)

- **Fond** : `#FFFFFF` (Blanc pur)
- **Texte** : `#1A1A1A` (Noir doux)
- **Icône fond** : `#F3F4F6` (Gris clair)
- **Icône couleur** : `#9CA3AF` (Gris)
- **Bordure** : Or `#D4AF37` (2px)
- **Ombre** : Légère grise

---

## Checklist de Vérification

- [x] BusinessCard applique les couleurs selon statut
- [x] SignatureCard applique les couleurs selon tier
- [x] Couleur "Découverte" unifiée (#FFFFFF)
- [x] Bordure dorée de 2px pour tous les statuts
- [x] Effet de brillance pour Elite/Premium/Artisan
- [x] Build réussi sans erreur
- [x] Page Accueil utilise BusinessCard
- [x] Page Entreprises utilise BusinessCard
- [x] BusinessDirectory utilise SignatureCard

---

## Résumé

L'uniformisation des cartes est **complète** :

1. ✅ **Composant unique par page** : BusinessCard pour Home/Businesses, SignatureCard pour Directory
2. ✅ **Logique de couleur cohérente** : `getBusinessStyle()` et `getTierStyles()` appliquent les mêmes couleurs
3. ✅ **Bordure dorée** : 2px `#D4AF37` pour tous les statuts
4. ✅ **Cohérence totale** : Aucun style basique, tous les statuts ressortent immédiatement

**Statut Final** : 🟢 Uniformisation réussie

---

**Fin du Document**
