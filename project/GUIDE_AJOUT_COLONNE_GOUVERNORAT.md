# Guide : Ajout de la colonne gouvernorat à la table entreprise

## Contexte

Le site utilise maintenant un composant standardisé `LocationSelectTunisie` qui permet de sélectionner un gouvernorat tunisien dans toutes les barres de recherche.

Actuellement, la table `entreprise` ne contient pas de colonne `gouvernorat`, mais elle contient une colonne `ville`.

## Étape 1 : Ajouter la colonne gouvernorat

Exécutez cette migration SQL dans Supabase :

```sql
-- Ajout de la colonne gouvernorat à la table entreprise
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS gouvernorat TEXT;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_entreprise_gouvernorat
ON entreprise(gouvernorat);

-- Mettre à jour les données existantes (optionnel, si vous avez une correspondance ville->gouvernorat)
-- Exemples de mises à jour :
UPDATE entreprise SET gouvernorat = 'Tunis' WHERE ville ILIKE '%tunis%';
UPDATE entreprise SET gouvernorat = 'Ariana' WHERE ville ILIKE '%ariana%';
UPDATE entreprise SET gouvernorat = 'Ben Arous' WHERE ville ILIKE '%ben arous%';
UPDATE entreprise SET gouvernorat = 'Sousse' WHERE ville ILIKE '%sousse%';
UPDATE entreprise SET gouvernorat = 'Sfax' WHERE ville ILIKE '%sfax%';
-- ... (ajoutez les autres correspondances selon vos données)
```

## Étape 2 : Adapter les requêtes Supabase

### Exemple actuel (utilise `ville`)

```typescript
if (params.city) {
  query = query.ilike('ville', `%${params.city}%`);
}
```

### Nouvelle version (utilise `gouvernorat`)

```typescript
if (params.city) {
  // Recherche exacte sur le gouvernorat
  query = query.eq('gouvernorat', params.city);
}
```

OU, si vous voulez permettre une recherche flexible :

```typescript
if (params.city) {
  // Recherche sur gouvernorat OU ville
  query = query.or(`gouvernorat.eq.${params.city},ville.ilike.%${params.city}%`);
}
```

## Étape 3 : Fichiers à adapter

Une fois la colonne `gouvernorat` créée, adaptez les requêtes dans ces fichiers :

### 1. `/src/pages/EducationNew.tsx` - ligne 394

**AVANT :**
```typescript
if (params.city) {
  query = query.ilike('ville', `%${params.city}%`);
}
```

**APRÈS :**
```typescript
if (params.city) {
  query = query.eq('gouvernorat', params.city);
}
```

### 2. `/src/pages/CitizensHealth.tsx` - ligne 67

**AVANT :**
```typescript
if (city) query = query.ilike('ville', `%${city}%`);
```

**APRÈS :**
```typescript
if (city) query = query.eq('gouvernorat', city);
```

### 3. `/src/pages/CitizensHealth.tsx` - ligne 113

**AVANT :**
```typescript
if (ville) query = query.ilike('ville', `%${ville}%`);
```

**APRÈS :**
```typescript
if (ville) query = query.eq('gouvernorat', ville);
```

### 4. `/src/pages/LocalMarketplace.tsx` - recherche des annonces

Cherchez les lignes qui filtrent par ville et remplacez par gouvernorat.

### 5. Autres pages avec SectorSearchBar

Toutes les pages qui utilisent `SectorSearchBar` (via handleSectorSearch) bénéficieront automatiquement du changement dans EducationNew.tsx, car elles utilisent la même logique.

## Étape 4 : Tester

1. Relancez l'application
2. Allez sur la page Éducation
3. Sélectionnez un gouvernorat dans le menu déroulant
4. Vérifiez que les résultats sont filtrés correctement

## Avantages de cette approche

1. **Standardisation** : Liste unique des 24 gouvernorats tunisiens
2. **Pas d'erreurs de saisie** : Menu déroulant au lieu de texte libre
3. **Performance** : Recherche exacte (`eq`) plus rapide que ILIKE
4. **Cohérence** : Même expérience utilisateur sur toutes les pages

## Liste des gouvernorats

Les 24 gouvernorats tunisiens sont définis dans `/src/lib/tunisiaLocations.ts` :

- Tunis, Ariana, Ben Arous, La Manouba
- Nabeul, Zaghouan, Bizerte, Béja
- Jendouba, Le Kef, Siliana
- Sousse, Monastir, Mahdia, Sfax
- Kairouan, Kasserine, Sidi Bouzid
- Gabès, Médenine, Tataouine
- Gafsa, Tozeur, Kébili

## Notes importantes

- La colonne `ville` reste utile pour afficher l'adresse complète
- La colonne `gouvernorat` sert uniquement pour le filtrage
- Les deux colonnes peuvent coexister sans problème
