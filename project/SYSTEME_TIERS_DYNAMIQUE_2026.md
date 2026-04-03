# Système de Tiers Dynamique - Dalil Tounes 2026

## Vue d'ensemble

Le système de tiers dynamique applique automatiquement les styles visuels appropriés aux fiches d'entreprises selon leur plan d'abonnement stocké dans Supabase.

## Architecture

### 1. Base de Données

#### Table `entreprise`

**Colonnes relatives aux abonnements :**
- `subscription_tier` (TEXT, DEFAULT 'gratuit') : Palier d'abonnement de l'entreprise
- `is_premium` (BOOLEAN, DEFAULT false) : Indicateur premium (rétrocompatibilité)

**Valeurs autorisées pour `subscription_tier` :**
- `'gratuit'` ou `'decouverte'` → Tier Découverte
- `'artisan'` → Tier Artisan (Mauve Premium)
- `'premium'` → Tier Premium (Vert Émeraude)
- `'elite'` ou `'elite_pro'` → Tier Élite Pro (Anthracite)
- `'custom'` ou `'personnalise'` ou `'sur_mesure'` → Tier Custom

**Contrainte de validation :**
```sql
CHECK (subscription_tier IN (
  'gratuit', 'decouverte', 'artisan', 'premium',
  'elite', 'elite_pro', 'custom', 'personnalise', 'sur_mesure'
))
```

**Index de performance :**
```sql
CREATE INDEX idx_entreprise_subscription_tier ON entreprise(subscription_tier);
```

### 2. Utilitaires de Mapping

**Fichier :** `src/lib/subscriptionTiers.ts`

#### Fonction principale : `mapSubscriptionToTier()`

Convertit les données de la BDD vers le tier visuel :

```typescript
import { mapSubscriptionToTier } from '../lib/subscriptionTiers';

const tier = mapSubscriptionToTier({
  subscription_tier: business.subscription_tier,
  is_premium: business.is_premium
});
// Retourne: 'decouverte' | 'artisan' | 'premium' | 'elite' | 'custom'
```

**Logique de mapping :**
1. Lit `subscription_tier` de la base de données
2. Normalise la valeur (lowercase, trim)
3. Mappe vers un des 5 tiers visuels
4. Fallback sur `is_premium` si besoin (rétrocompatibilité)
5. Par défaut retourne `'decouverte'`

#### Fonctions auxiliaires

**Obtenir la couleur de texte :**
```typescript
import { getTierTextColor } from '../lib/subscriptionTiers';

const textColor = getTierTextColor(tier);
// Retourne: 'text-white' | 'text-[#D4AF37]' | 'text-gray-900'
```

**Obtenir la couleur de texte secondaire :**
```typescript
import { getTierSecondaryTextColor } from '../lib/subscriptionTiers';

const secondaryColor = getTierSecondaryTextColor(tier);
// Retourne: 'text-gray-200' | 'text-gray-300' | 'text-gray-600'
```

**Vérifier si premium :**
```typescript
import { isPremiumTier } from '../lib/subscriptionTiers';

const isPremium = isPremiumTier(tier);
// Retourne: true pour artisan, premium, elite | false pour decouverte, custom
```

**Obtenir le label localisé :**
```typescript
import { getTierLabel } from '../lib/subscriptionTiers';

const label = getTierLabel(tier, language);
// Retourne: 'Artisan' | 'Premium' | 'Élite Pro' etc.
```

## Utilisation dans les Composants

### Exemple complet : BusinessDirectory

```typescript
import { mapSubscriptionToTier, getTierTextColor, getTierSecondaryTextColor } from '../../lib/subscriptionTiers';

// Dans le rendu des cartes
{filteredBusinesses.map((business) => {
  // 1. Mapper le tier depuis la BDD
  const tier = mapSubscriptionToTier({
    subscription_tier: business.subscription_tier,
    is_premium: business.is_premium
  });

  // 2. Obtenir les couleurs appropriées
  const textColor = getTierTextColor(tier);
  const secondaryTextColor = getTierSecondaryTextColor(tier);

  // 3. Appliquer le tier à SignatureCard
  return (
    <SignatureCard tier={tier} className="p-6">
      {/* Titre avec couleur dynamique */}
      <h3 className={`text-xl font-bold ${textColor}`}>
        {business.nom}
      </h3>

      {/* Texte secondaire avec couleur dynamique */}
      <p className={secondaryTextColor}>
        {business.description}
      </p>

      {/* Bouton avec style dynamique */}
      <button className={
        tier === 'artisan' ? 'bg-[#D4AF37] text-[#4A1D43]' :
        tier === 'premium' ? 'bg-[#D4AF37] text-[#064E3B]' :
        tier === 'elite' ? 'bg-[#D4AF37] text-[#121212]' :
        'border-2 border-[#D4AF37] text-[#D4AF37]'
      }>
        Voir la fiche
      </button>
    </SignatureCard>
  );
})}
```

## Styles Visuels par Tier

### Découverte (Gratuit)

**Caractéristiques visuelles :**
- Fond : Gris clair `#F8FAFC`
- Bordure : Dorée fine `1px solid #D4AF37`
- Texte principal : `text-gray-900`
- Texte secondaire : `text-gray-600`
- Bouton : Contour doré, remplissage au survol

**Quand l'appliquer :**
- `subscription_tier = 'gratuit'`
- `subscription_tier = 'decouverte'`
- `subscription_tier IS NULL`
- `is_premium = false` (fallback)

### Artisan (Mauve Premium)

**Caractéristiques visuelles :**
- Fond : Mauve profond `#4A1D43`
- Bordure : Dorée épaisse `2px solid #D4AF37` avec lueur
- Texte principal : `text-white`
- Texte secondaire : `text-gray-200`
- Bouton : Fond doré `#D4AF37` avec texte mauve
- Badge : "ARTISAN" en or avec étoile

**Quand l'appliquer :**
- `subscription_tier = 'artisan'`

### Premium (Vert Émeraude)

**Caractéristiques visuelles :**
- Fond : Vert émeraude `#064E3B`
- Bordure : Dorée épaisse `2px solid #D4AF37` avec lueur
- Texte principal : `text-white`
- Texte secondaire : `text-gray-200`
- Bouton : Fond doré `#D4AF37` avec texte vert
- Badge : "PREMIUM" en or avec étoile

**Quand l'appliquer :**
- `subscription_tier = 'premium'`

### Élite Pro (Anthracite)

**Caractéristiques visuelles :**
- Fond : Anthracite `#121212`
- Bordure : Dorée épaisse `2px solid #D4AF37` avec lueur intense
- Texte principal : `text-[#D4AF37]` (or)
- Texte secondaire : `text-gray-300`
- Bouton : Fond doré `#D4AF37` avec texte anthracite
- Badge : "ÉLITE PRO" en or avec étoile

**Quand l'appliquer :**
- `subscription_tier = 'elite'`
- `subscription_tier = 'elite_pro'`

### Custom (Sur-mesure)

**Caractéristiques visuelles :**
- Fond : Gris clair `#F9FAFB`
- Bordure : Pointillée grise `2px dashed #9CA3AF`
- Texte principal : `text-gray-900`
- Texte secondaire : `text-gray-600`
- Bouton : Fond gris foncé avec texte blanc
- Pas de badge

**Quand l'appliquer :**
- `subscription_tier = 'custom'`
- `subscription_tier = 'personnalise'`
- `subscription_tier = 'sur_mesure'`

## Gestion des Abonnements

### Mise à jour du tier d'une entreprise

```sql
-- Passer une entreprise en Artisan
UPDATE entreprise
SET subscription_tier = 'artisan'
WHERE id = 'uuid-de-entreprise';

-- Passer une entreprise en Premium
UPDATE entreprise
SET subscription_tier = 'premium'
WHERE id = 'uuid-de-entreprise';

-- Rétrograder une entreprise en Gratuit
UPDATE entreprise
SET subscription_tier = 'gratuit'
WHERE id = 'uuid-de-entreprise';
```

### Recherche par tier

```sql
-- Récupérer toutes les entreprises Premium
SELECT * FROM entreprise
WHERE subscription_tier = 'premium';

-- Récupérer toutes les entreprises avec abonnement payant
SELECT * FROM entreprise
WHERE subscription_tier IN ('artisan', 'premium', 'elite', 'elite_pro');

-- Compter les entreprises par tier
SELECT subscription_tier, COUNT(*) as total
FROM entreprise
GROUP BY subscription_tier
ORDER BY total DESC;
```

## Rétrocompatibilité

Le système est rétrocompatible avec l'ancien système basé sur `is_premium` :

**Comportement :**
1. Si `subscription_tier` est défini → utilise cette valeur
2. Si `subscription_tier` est NULL et `is_premium = true` → tier 'artisan'
3. Sinon → tier 'decouverte'

**Migration des anciennes données :**
```sql
-- Migrer les entreprises premium vers Artisan
UPDATE entreprise
SET subscription_tier = 'artisan'
WHERE is_premium = true AND subscription_tier IS NULL;

-- Migrer les entreprises gratuites vers Découverte
UPDATE entreprise
SET subscription_tier = 'gratuit'
WHERE is_premium = false AND subscription_tier IS NULL;
```

## Tests et Démonstration

### Créer des entreprises de test avec différents tiers

```sql
-- Exemple Découverte
INSERT INTO entreprise (nom, ville, categories, subscription_tier)
VALUES ('Restaurant Test Gratuit', 'Tunis', 'Restaurant', 'gratuit');

-- Exemple Artisan
INSERT INTO entreprise (nom, ville, categories, subscription_tier)
VALUES ('Restaurant Test Artisan', 'Tunis', 'Restaurant', 'artisan');

-- Exemple Premium
INSERT INTO entreprise (nom, ville, categories, subscription_tier)
VALUES ('Hôtel Test Premium', 'Sousse', 'Hôtellerie', 'premium');

-- Exemple Élite Pro
INSERT INTO entreprise (nom, ville, categories, subscription_tier)
VALUES ('Cabinet Test Elite', 'Sfax', 'Services Juridiques', 'elite');
```

## Extensibilité

### Ajouter un nouveau tier

1. **Ajouter la valeur dans la contrainte de validation :**
```sql
ALTER TABLE entreprise
DROP CONSTRAINT entreprise_subscription_tier_check;

ALTER TABLE entreprise
ADD CONSTRAINT entreprise_subscription_tier_check
CHECK (subscription_tier IN (
  'gratuit', 'decouverte', 'artisan', 'premium',
  'elite', 'elite_pro', 'custom', 'nouveau_tier'
));
```

2. **Mettre à jour le type TypeScript :**
```typescript
// src/lib/subscriptionTiers.ts
export type SubscriptionTier =
  | 'decouverte'
  | 'artisan'
  | 'premium'
  | 'elite'
  | 'custom'
  | 'nouveau_tier';
```

3. **Ajouter le mapping dans la fonction :**
```typescript
export function mapSubscriptionToTier(data: SubscriptionData): SubscriptionTier {
  // ... code existant ...

  if (tier === 'nouveau_tier') {
    return 'nouveau_tier';
  }

  // ... reste du code ...
}
```

4. **Définir les styles dans SignatureCard :**
```typescript
// src/components/SignatureCard.tsx
case 'nouveau_tier':
  return {
    bg: 'bg-[#COULEUR]',
    border: 'border-[2px] border-[#D4AF37]',
    shadow: 'shadow-[...]'
  };
```

## Avantages du Système

1. **Centralisation** : Un seul endroit pour gérer les tiers (base de données)
2. **Automatique** : Les styles s'appliquent automatiquement sans code supplémentaire
3. **Flexible** : Facile d'ajouter de nouveaux tiers
4. **Performant** : Index sur `subscription_tier` pour des recherches rapides
5. **Type-safe** : TypeScript assure la cohérence des tiers
6. **Rétrocompatible** : Fonctionne avec l'ancien système `is_premium`
7. **Évolutif** : Permet des abonnements plus granulaires

## Fichiers Modifiés

- `src/lib/subscriptionTiers.ts` - Utilitaires de mapping (NOUVEAU)
- `src/components/SignatureCard.tsx` - Support des tiers
- `src/components/business/BusinessDirectory.tsx` - Utilisation dynamique
- `supabase/migrations/[timestamp]_add_subscription_tier_column.sql` - Colonne BDD

---

**Date de création :** 3 février 2026
**Version :** 1.0
**Auteur :** Système Dalil Tounes
