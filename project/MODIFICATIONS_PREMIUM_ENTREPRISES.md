# Modifications - Système Premium et Filtrage des Entreprises

## Vue d'ensemble

Ce document décrit les modifications apportées pour implémenter le système d'entreprises Premium et améliorer le filtrage des entreprises similaires.

---

## Modifications de la base de données

### 1. Ajout du champ `is_premium`

**Migration** : `add_is_premium_to_entreprise.sql`

**Changements** :
- Ajout de la colonne `is_premium` (boolean) à la table `entreprise`
- Valeur par défaut : `false`
- Index créé pour optimiser les recherches : `idx_entreprise_is_premium`
- Index composite créé : `idx_entreprise_categorie_premium` (pour les requêtes par catégorie + premium)

**Usage** :
```sql
-- Marquer une entreprise comme premium
UPDATE entreprise SET is_premium = true WHERE id = 'id_entreprise';

-- Chercher toutes les entreprises premium
SELECT * FROM entreprise WHERE is_premium = true;
```

---

## Modifications du code

### 1. Page BusinessDetail (`src/pages/BusinessDetail.tsx`)

#### Entreprises similaires - Avant
```typescript
// Recherche par ville ET catégorie
.eq('ville', data.ville)
.eq('categorie', data.categorie)
.neq('id', data.id)
.limit(5);
```

#### Entreprises similaires - Après
```typescript
// Recherche par catégorie uniquement
.eq('categorie', data.categorie)
.neq('id', data.id)
.order('is_premium', { ascending: false, nullsFirst: false })
.order('nom', { ascending: true })
.limit(6);
```

**Changements clés** :
- ✅ Filtrage uniquement par **catégorie** (plus de filtre par ville)
- ✅ **Exclusion** de l'entreprise actuelle (`.neq('id', data.id)`)
- ✅ **Priorisation** des entreprises Premium en premier
- ✅ Tri secondaire par nom alphabétique
- ✅ Limite augmentée à **6 entreprises** (au lieu de 5)
- ✅ Ajout du champ `is_premium` dans le SELECT

**Impact** :
- Les entreprises de la même catégorie sont affichées, peu importe leur ville
- Les entreprises Premium apparaissent en premier dans la liste
- L'entreprise consultée n'apparaît jamais dans ses propres suggestions

---

### 2. Composant FeaturedBusinessesStrip (`src/components/FeaturedBusinessesStrip.tsx`)

#### Interfaces mises à jour
```typescript
interface BusinessRow {
  // ... autres champs
  is_premium: boolean | null;  // AJOUTÉ
}

interface BusinessCard {
  // ... autres champs
  isPremium: boolean;  // AJOUTÉ
}
```

#### Requête Supabase - Avant
```typescript
.select(`
  id, nom, ville, categorie,
  description, image_url
`)
.limit(80);
```

#### Requête Supabase - Après
```typescript
.select(`
  id, nom, ville, categorie,
  description, image_url,
  is_premium
`)
.order('is_premium', { ascending: false, nullsFirst: false })
.limit(80);
```

#### Fonction selectByVariant - Variante 'home'

**Avant** :
```typescript
// Mélange de catégories, jusqu'à 10 entreprises
const b2b = all.filter(...).slice(0, 4);
const daily = all.filter(...).slice(0, 4);
const shops = all.filter(...).slice(0, 4);
return unique.slice(0, 10);
```

**Après** :
```typescript
// Tri par Premium d'abord, puis mélange, limite à 6
const sorted = [...all].sort((a, b) => {
  if (a.isPremium && !b.isPremium) return -1;
  if (!a.isPremium && b.isPremium) return 1;
  return 0;
});

const b2b = sorted.filter(...).slice(0, 2);
const daily = sorted.filter(...).slice(0, 2);
const shops = sorted.filter(...).slice(0, 2);
return unique.slice(0, 6);
```

**Changements clés** :
- ✅ **Maximum 6 entreprises** affichées sur la page d'accueil (au lieu de 10)
- ✅ **Priorisation des entreprises Premium** en premier dans le tri
- ✅ Équilibrage entre catégories : 2 B2B + 2 Services quotidiens + 2 Magasins
- ✅ Toutes les requêtes incluent maintenant le champ `is_premium`

---

## Résumé des comportements

### Page d'accueil (Home)
- ✅ Affiche **maximum 6 entreprises**
- ✅ **Priorité aux entreprises Premium**
- ✅ Mélange équilibré de catégories (B2B, services quotidiens, magasins)
- ✅ Si pas assez d'entreprises dans les catégories, affiche les 6 premières (premium en priorité)

### Page de détail d'entreprise (BusinessDetail)
Section "Entreprises similaires" :
- ✅ Affiche **maximum 6 entreprises**
- ✅ Filtre par **même catégorie** uniquement
- ✅ **Exclut l'entreprise actuelle** de la liste
- ✅ **Priorité aux entreprises Premium**
- ✅ Tri secondaire alphabétique par nom
- ✅ Si aucune entreprise de la même catégorie, affiche d'autres entreprises (premium en priorité)

---

## Tests et validation

### Build réussi
```bash
npm run build
✓ built in 13.96s
```

### Tests à effectuer

#### 1. Tester le marquage Premium
```sql
-- Marquer quelques entreprises comme premium pour tester
UPDATE entreprise
SET is_premium = true
WHERE id IN (
  SELECT id FROM entreprise LIMIT 3
);
```

#### 2. Vérifier la page d'accueil
- Accéder à la page d'accueil
- Vérifier que maximum 6 entreprises s'affichent
- Vérifier que les entreprises Premium (si marquées) apparaissent en premier

#### 3. Vérifier les entreprises similaires
- Accéder à une fiche entreprise
- Vérifier que la section "Entreprises similaires" affiche :
  - Maximum 6 entreprises
  - Uniquement des entreprises de la même catégorie
  - Pas l'entreprise actuelle
  - Les entreprises Premium en premier

---

## Performance

### Index créés
Pour optimiser les performances des nouvelles requêtes :

1. **idx_entreprise_is_premium** - Pour les requêtes filtrant sur `is_premium = true`
2. **idx_entreprise_categorie_premium** - Pour les requêtes combinant `categorie` et `is_premium`

Ces index garantissent que les requêtes restent rapides même avec des milliers d'entreprises.

---

## Gestion du statut Premium

### Activer le Premium pour une entreprise
```sql
UPDATE entreprise
SET is_premium = true
WHERE id = 'id_de_entreprise';
```

### Désactiver le Premium
```sql
UPDATE entreprise
SET is_premium = false
WHERE id = 'id_de_entreprise';
```

### Lister toutes les entreprises Premium
```sql
SELECT id, nom, categorie, ville, is_premium
FROM entreprise
WHERE is_premium = true
ORDER BY nom;
```

### Statistiques Premium
```sql
-- Nombre d'entreprises premium par catégorie
SELECT
  categorie,
  COUNT(*) as total_premium
FROM entreprise
WHERE is_premium = true
GROUP BY categorie
ORDER BY total_premium DESC;
```

---

## Fichiers modifiés

1. **Migration** : `supabase/migrations/add_is_premium_to_entreprise.sql`
2. **Page** : `src/pages/BusinessDetail.tsx`
3. **Composant** : `src/components/FeaturedBusinessesStrip.tsx`

---

## Points à noter

### Comportement par défaut
- Toutes les entreprises existantes ont `is_premium = false` par défaut
- Les nouvelles entreprises créées auront aussi `is_premium = false` par défaut
- Aucune entreprise n'est Premium automatiquement

### Rétrocompatibilité
- Les anciennes données continuent de fonctionner
- Le champ `is_premium` est nullable pour assurer la compatibilité
- Si `is_premium` est NULL, il est traité comme `false`

### Évolutivité
- Le système est prêt pour une future page d'administration Premium
- Les index optimisent les performances pour des milliers d'entreprises
- Le tri Premium est cohérent sur toutes les pages

---

## Prochaines étapes suggérées

1. **Interface d'administration** : Créer une interface pour gérer le statut Premium des entreprises
2. **Badge visuel** : Ajouter un badge "Premium" visible sur les cartes d'entreprises premium
3. **Durée d'abonnement** : Ajouter des champs pour gérer la durée de l'abonnement premium
4. **Analytics** : Suivre les performances des entreprises Premium vs non-Premium

---

## Support

Pour toute question ou problème concernant ces modifications, consultez :
- Ce document de référence
- Les commentaires dans le code
- La migration SQL pour la structure de la base de données
