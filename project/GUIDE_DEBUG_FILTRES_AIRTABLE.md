# Guide de Débogage - Filtres Airtable

## Date : 27 Février 2026

---

## Problème rencontré

Les données ne s'affichent pas malgré une logique correcte. Cause probable : problème de syntaxe SQL avec les colonnes contenant des espaces.

---

## Corrections appliquées

### 1. Syntaxe SQL corrigée

**AVANT (INCORRECT) :**
```typescript
.eq('mise en avant pub', true)  // ❌ Sans guillemets
.or('mise en avant pub.is.null,mise en avant pub.eq.false')  // ❌ Sans guillemets
```

**APRÈS (CORRECT) :**
```typescript
.eq('"mise en avant pub"', true)  // ✅ Avec guillemets doubles
.or('"mise en avant pub".is.null,"mise en avant pub".eq.false')  // ✅ Avec guillemets doubles
```

### Règle importante

**Colonnes avec espaces = TOUJOURS guillemets doubles dans Supabase JS :**

```typescript
// ✅ CORRECT
.eq('"mise en avant pub"', true)
.select('"niveau priorité abonnement"')

// ❌ INCORRECT
.eq('mise en avant pub', true)
.select('niveau priorité abonnement')
```

---

## Console logs ajoutés

### PremiumPartnersSection.tsx

**Ajouts aux lignes 30, 45, 61, 77, 89 :**

```typescript
console.log('[PremiumPartnersSection] 🔍 Recherche des entreprises avec "mise en avant pub"...');

console.log('[PremiumPartnersSection] 📊 Données à la une:', {
  count: featuredData?.length || 0,
  data: featuredData,
  error: featuredError
});

console.log('[PremiumPartnersSection] ✅ Total final:', combinedPartners.length, 'entreprises');
```

### LocalBusinessesSection.tsx

**Ajouts aux lignes 28, 41 :**

```typescript
console.log('[LocalBusinessesSection] 🔍 Recherche des commerces locaux...');

console.log('[LocalBusinessesSection] 📊 Données commerces locaux:', {
  count: data?.length || 0,
  data: data
});
```

---

## Comment déboguer dans le navigateur

### Étape 1 : Ouvrir la console

```
Chrome/Edge : F12 → Onglet "Console"
Firefox : F12 → Onglet "Console"
Safari : Cmd+Option+C
```

### Étape 2 : Recharger la page d'accueil

```
Appuyez sur F5 ou Cmd+R
```

### Étape 3 : Analyser les logs

**Si tout fonctionne, vous verrez :**

```
[PremiumPartnersSection] 🔍 Recherche des entreprises avec "mise en avant pub"...
[PremiumPartnersSection] 📊 Données à la une: {count: 4, data: Array(4), error: null}
[PremiumPartnersSection] ✅ 4 entreprises trouvées, affichage direct
[LocalBusinessesSection] 🔍 Recherche des commerces locaux...
[LocalBusinessesSection] 📊 Données commerces locaux: {count: 6, data: Array(6)}
```

**Si erreur de syntaxe SQL :**

```
[PremiumPartnersSection] 🔍 Recherche des entreprises avec "mise en avant pub"...
[PremiumPartnersSection] ❌ Erreur requête featured: {
  message: "column \"mise en avant pub\" does not exist",
  code: "42703"
}
```

**Si aucune donnée trouvée :**

```
[PremiumPartnersSection] 🔍 Recherche des entreprises avec "mise en avant pub"...
[PremiumPartnersSection] 📊 Données à la une: {count: 0, data: [], error: null}
[PremiumPartnersSection] ⚠️ Seulement 0 entreprises trouvées, recherche de 4 complémentaires...
```

---

## Scénarios de débogage

### Scénario 1 : La colonne n'existe pas

**Erreur dans la console :**
```
column "mise en avant pub" does not exist
```

**Solution :**
```sql
-- Vérifier l'existence de la colonne
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name ILIKE '%mise%';

-- Si la colonne n'existe pas, la créer
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS "mise en avant pub" boolean DEFAULT false;

ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS page_commerce_local boolean DEFAULT false;
```

### Scénario 2 : Type de donnée incorrect

**Symptôme :** Aucune erreur mais count = 0 alors que des cases sont cochées dans Airtable

**Cause possible :** Whalesync/Zapier envoie 'true' (texte) au lieu de true (boolean)

**Vérification :**

Exécuter le script `DEBUG_COLONNES_MISE_EN_AVANT.sql` :

```sql
-- Vérifier le type réel des données
SELECT
    "mise en avant pub" as valeur,
    pg_typeof("mise en avant pub") as type_pg,
    COUNT(*) as nombre
FROM entreprise
GROUP BY "mise en avant pub";
```

**Résultat attendu :**
```
┌────────┬──────────┬────────┐
│ valeur │ type_pg  │ nombre │
├────────┼──────────┼────────┤
│ true   │ boolean  │ 5      │
│ false  │ boolean  │ 120    │
│ NULL   │ boolean  │ 30     │
└────────┴──────────┴────────┘
```

**Si type_pg = 'text' :**

```typescript
// Modifier le filtre dans le code
.eq('"mise en avant pub"', 'true')  // String 'true' au lieu de boolean true
```

**Ou corriger dans Supabase :**

```sql
-- Convertir la colonne text en boolean
ALTER TABLE entreprise
ALTER COLUMN "mise en avant pub"
TYPE boolean
USING CASE
  WHEN "mise en avant pub"::text = 'true' THEN true
  WHEN "mise en avant pub"::text = 'false' THEN false
  ELSE NULL
END;
```

### Scénario 3 : Les données Airtable ne sont pas synchronisées

**Symptôme :** Console logs montrent count = 0 mais les cases sont cochées dans Airtable

**Vérifications :**

1. **Whalesync/Zapier est-il actif ?**
   - Vérifier les logs de synchronisation
   - Vérifier la dernière date de sync

2. **Les données sont-elles dans Supabase ?**

```sql
-- Compter les entreprises avec cases cochées
SELECT
  COUNT(*) FILTER (WHERE "mise en avant pub" = true) as mise_en_avant,
  COUNT(*) FILTER (WHERE page_commerce_local = true) as commerce_local
FROM entreprise;
```

3. **Forcer une synchronisation manuelle**

### Scénario 4 : Conflit de noms de colonnes

**Symptôme :** Deux colonnes similaires existent

Exemple dans votre base :
- `"mise en avant pub"` (avec espaces)
- `mise_en_avant_pub` (avec underscores)

**Vérification :**

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name ILIKE '%mise%';
```

**Solution :**

Utiliser la colonne correcte synchronisée par Airtable (celle avec espaces généralement).

### Scénario 5 : Problème de permissions RLS

**Symptôme :** Erreur "insufficient privileges" ou données vides alors qu'elles existent

**Vérification :**

```sql
-- Vérifier les policies RLS sur la table
SELECT *
FROM pg_policies
WHERE tablename = 'entreprise';
```

**Solution :**

```sql
-- S'assurer qu'il existe une policy SELECT publique
CREATE POLICY IF NOT EXISTS "Allow public read access to entreprise"
ON entreprise
FOR SELECT
TO public
USING (true);
```

---

## Script SQL de test complet

**Fichier :** `DEBUG_COLONNES_MISE_EN_AVANT.sql`

Ce script vérifie :
1. Existence et type des colonnes
2. Valeurs distinctes et leur type PostgreSQL
3. Différents filtres possibles
4. Échantillon de données
5. Compteurs par catégorie
6. Index existants

**Exécution :**

```bash
# Depuis la console Supabase SQL Editor
# Coller le contenu de DEBUG_COLONNES_MISE_EN_AVANT.sql
# Exécuter toutes les requêtes
```

---

## Tests de validation

### Test 1 : Vérifier que les données s'affichent

```
1. Ouvrir la page d'accueil
2. Ouvrir la console (F12)
3. Chercher les logs:
   "[PremiumPartnersSection] 📊 Données à la une"
   "[LocalBusinessesSection] 📊 Données commerces locaux"
4. Vérifier que count > 0
5. Vérifier que data contient des objets
```

### Test 2 : Vérifier l'ordre de tri

```
1. Dans les logs, regarder l'array data
2. Vérifier que data[0]["niveau priorité abonnement"] >= data[1]["niveau priorité abonnement"]
```

### Test 3 : Test de synchronisation

```
1. Cocher une case "Mise en avant pub" dans Airtable
2. Attendre la synchronisation (2-5 minutes)
3. Recharger la page d'accueil
4. Vérifier dans les logs que count a augmenté
5. Vérifier visuellement que l'entreprise apparaît
```

### Test 4 : Test de suppression

```
1. Décocher une case dans Airtable
2. Attendre la synchronisation
3. Recharger la page d'accueil
4. Vérifier que count a diminué
5. Vérifier que l'entreprise a disparu
```

---

## Alternatives de filtrage

Si `.eq('"mise en avant pub"', true)` ne fonctionne pas, essayer :

### Option 1 : IS TRUE

```typescript
.is('"mise en avant pub"', true)
```

### Option 2 : Comparaison explicite

```typescript
.filter('"mise en avant pub"', 'eq', true)
```

### Option 3 : Si stocké comme texte

```typescript
.eq('"mise en avant pub"', 'true')  // String
```

### Option 4 : Utiliser une vue SQL

Créer une vue qui convertit automatiquement :

```sql
CREATE OR REPLACE VIEW entreprise_featured AS
SELECT
  *,
  CASE
    WHEN "mise en avant pub" = true OR "mise en avant pub"::text = 'true' THEN true
    ELSE false
  END as is_featured
FROM entreprise;
```

Puis dans le code :

```typescript
.from('entreprise_featured')
.eq('is_featured', true)
```

---

## Checklist de débogage

**Avant de demander de l'aide, vérifier :**

- [ ] Les guillemets doubles sont bien présents : `'"mise en avant pub"'`
- [ ] La colonne existe dans Supabase : `SELECT "mise en avant pub" FROM entreprise LIMIT 1;`
- [ ] Le type de la colonne est boolean : `SELECT pg_typeof("mise en avant pub") FROM entreprise LIMIT 1;`
- [ ] Il existe des lignes avec true : `SELECT COUNT(*) FROM entreprise WHERE "mise en avant pub" = true;`
- [ ] Les policies RLS permettent la lecture : `SELECT * FROM pg_policies WHERE tablename = 'entreprise';`
- [ ] La synchronisation Airtable fonctionne : Vérifier les logs Whalesync/Zapier
- [ ] Les console.logs apparaissent dans le navigateur : F12 → Console
- [ ] Le build réussit sans erreur : `npm run build`

---

## Exemples de requêtes fonctionnelles

### Requête 1 : Établissements à la une

```typescript
const { data, error } = await supabase
  .from('entreprise')
  .select('id, nom, ville, "mise en avant pub"')
  .eq('"mise en avant pub"', true)
  .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
  .limit(4);

console.log('Données:', data);  // Devrait afficher un array avec des objets
```

### Requête 2 : Commerces locaux

```typescript
const { data, error } = await supabase
  .from('entreprise')
  .select('id, nom, ville, page_commerce_local')
  .eq('page_commerce_local', true)
  .order('created_at', { ascending: false })
  .limit(6);

console.log('Données:', data);  // Devrait afficher un array avec des objets
```

### Requête 3 : Test direct dans la console SQL Supabase

```sql
-- Test 1: Vérifier les entreprises avec mise en avant
SELECT id, nom, "mise en avant pub"
FROM entreprise
WHERE "mise en avant pub" = true
LIMIT 5;

-- Test 2: Vérifier les commerces locaux
SELECT id, nom, page_commerce_local
FROM entreprise
WHERE page_commerce_local = true
LIMIT 5;

-- Si ces requêtes retournent 0 lignes, le problème est dans les données, pas dans le code
```

---

## Support

### Logs à fournir en cas de problème

1. **Console du navigateur (F12) :**
   - Tous les logs `[PremiumPartnersSection]`
   - Tous les logs `[LocalBusinessesSection]`
   - Erreurs en rouge

2. **Résultat du script SQL :**
   - Exécuter `DEBUG_COLONNES_MISE_EN_AVANT.sql`
   - Copier tous les résultats

3. **Statut de synchronisation Airtable :**
   - Dernière date de sync réussie
   - Nombre d'enregistrements synchronisés

4. **Screenshot de la table Airtable :**
   - Montrant les cases cochées
   - Avec les noms d'entreprises visibles

---

## Fichiers modifiés

```
src/components/PremiumPartnersSection.tsx
  ├── Ligne 36 : .eq('"mise en avant pub"', true)  ✅
  ├── Ligne 66 : .or('"mise en avant pub".is.null')  ✅
  └── Lignes 30, 45, 61, 77, 89 : Console logs ajoutés

src/components/LocalBusinessesSection.tsx
  ├── Ligne 33 : .eq('page_commerce_local', true)  ✅
  └── Lignes 28, 41 : Console logs ajoutés

DEBUG_COLONNES_MISE_EN_AVANT.sql (NOUVEAU)
  └── Script de diagnostic complet
```

---

## Prochaines étapes

1. **Ouvrir la page d'accueil**
2. **Ouvrir la console (F12)**
3. **Regarder les logs colorés avec emojis**
4. **Partager les résultats :**
   - Si count > 0 → Succès !
   - Si count = 0 → Exécuter le script SQL de debug
   - Si erreur → Partager le message d'erreur complet

---

*Documentation créée le 27 février 2026*
