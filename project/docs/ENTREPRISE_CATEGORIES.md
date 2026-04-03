# Système de Catégories pour les Entreprises

## Vue d'ensemble

Le secteur "entreprise" utilise un système de catégories standardisées pour classifier les activités professionnelles. Les catégories sont définies dans le code et stockées dans la base de données avec des valeurs techniques normalisées.

## Structure des catégories

Les catégories sont définies dans `src/lib/entrepriseCategories.ts` :

```typescript
export const ENTREPRISE_CATEGORIES = [
  { value: 'services_aux_entreprises', label: 'Services aux entreprises' },
  { value: 'transport_logistique', label: 'Transport & logistique' },
  { value: 'btp_construction', label: 'BTP / Construction' },
  { value: 'industrie', label: 'Industrie & fabrication' },
  { value: 'communication_marketing', label: 'Communication & marketing' },
  { value: 'informatique_telecom', label: 'Informatique & télécom' },
  { value: 'conseil_formation', label: 'Conseil & formation' },
  { value: 'autre_activite_pro', label: 'Autre activité professionnelle' },
];
```

### Valeurs techniques (value)

Les valeurs techniques sont stockées dans la colonne `sous_categories` de la table `entreprise` :
- Format : lowercase, underscores, sans accents
- Exemples : `services_aux_entreprises`, `transport_logistique`
- Utilisées pour les requêtes et filtres

### Labels lisibles (label)

Les labels sont affichés dans l'interface utilisateur :
- Format : lisible, avec accents et majuscules
- Exemples : "Services aux entreprises", "Transport & logistique"
- Utilisés dans les menus déroulants et l'affichage

## Utilisation dans la base de données

### Table `entreprise`

Pour les entreprises (secteur = 'entreprise'), la colonne `sous_categories` doit contenir l'une des valeurs suivantes :

- `services_aux_entreprises`
- `transport_logistique`
- `btp_construction`
- `industrie`
- `communication_marketing`
- `informatique_telecom`
- `conseil_formation`
- `autre_activite_pro`

### Exemple de requête SQL

```sql
-- Insérer une entreprise avec catégorie
INSERT INTO entreprise (nom, secteur, sous_categories, ville, ...)
VALUES ('ABC Consulting', 'entreprise', 'conseil_formation', 'Tunis', ...);

-- Mettre à jour la catégorie d'une entreprise
UPDATE entreprise
SET sous_categories = 'informatique_telecom'
WHERE id = '...' AND secteur = 'entreprise';
```

## Fonction de recherche RPC

La fonction `enterprise_search_list` utilise un **match exact** sur `sous_categories` :

```sql
-- Filtre sous-catégorie (EXACT MATCH)
AND (
  p_categorie IS NULL
  OR p_categorie = ''
  OR e.sous_categories = p_categorie  -- Match exact
)
```

Cela signifie que le paramètre `p_categorie` doit être exactement égal à la valeur technique (ex: `'services_aux_entreprises'`).

## Utilisation dans le code

### Composant de recherche

Le composant `BusinessSearchBar` utilise la constante pour générer le menu déroulant :

```typescript
import { ENTREPRISE_CATEGORIES } from '../lib/entrepriseCategories';

// Dans le select
<select value={selectedCategory} onChange={...}>
  <option value="">Toutes les catégories</option>
  {ENTREPRISE_CATEGORIES.map((category) => (
    <option key={category.value} value={category.value}>
      {category.label}
    </option>
  ))}
</select>
```

### Affichage des labels

Pour afficher le label à partir d'une valeur technique :

```typescript
import { getCategoryLabel } from '../lib/entrepriseCategories';

// Exemple
const label = getCategoryLabel('services_aux_entreprises');
// Retourne : "Services aux entreprises"
```

## Catégories par domaine

### Services aux entreprises
Inclut : comptabilité, juridique, ménage professionnel, sécurité, gestion, consulting, etc.

### Transport & logistique
Inclut : transport de marchandises, livraison, stockage, logistique, fret, etc.

### BTP / Construction
Inclut : construction, rénovation, maçonnerie, plomberie, électricité, etc.

### Industrie & fabrication
Inclut : usines, production, fabrication, transformation, etc.

### Communication & marketing
Inclut : publicité, agences de communication, design graphique, marketing digital, etc.

### Informatique & télécom
Inclut : développement logiciel, support IT, hébergement web, téléphonie, etc.

### Conseil & formation
Inclut : formation professionnelle, coaching, audit, conseil stratégique, etc.

### Autre activité professionnelle
Pour toutes les activités ne rentrant pas dans les catégories ci-dessus.

## Migration des données existantes

Si vous avez des entreprises avec des valeurs libres dans `sous_categories`, vous devrez les migrer vers les nouvelles valeurs standardisées :

```sql
-- Exemple de migration
UPDATE entreprise
SET sous_categories = 'services_aux_entreprises'
WHERE secteur = 'entreprise'
  AND (sous_categories ILIKE '%comptab%' OR sous_categories ILIKE '%juridique%');

UPDATE entreprise
SET sous_categories = 'transport_logistique'
WHERE secteur = 'entreprise'
  AND (sous_categories ILIKE '%transport%' OR sous_categories ILIKE '%logistique%');

-- etc.
```

## Impact sur les autres secteurs

Ce système de catégories concerne **uniquement le secteur 'entreprise'**.

Les autres secteurs (education, sante, etc.) conservent leurs propres systèmes de catégories indépendants.

La fonction RPC `enterprise_search_list` filtre automatiquement par `secteur = 'entreprise'`, donc il n'y a pas d'impact sur les autres secteurs.
