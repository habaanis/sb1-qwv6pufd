# 📘 Guide d'Utilisation - Audit Base de Données Dalil Tounes

## 🎯 Objectif de ce Guide

Ce document vous aide à **exploiter efficacement les résultats de l'audit** pour restructurer et optimiser la base de données Supabase de Dalil Tounes.

---

## 📂 Documents Générés par l'Audit

| Fichier | Description | Usage |
|---------|-------------|-------|
| `AUDIT_DATABASE_SUPABASE.md` | Rapport d'audit complet détaillé | 📖 Lecture, compréhension |
| `OPTIMISATIONS_PRIORITAIRES.sql` | Script SQL prêt à exécuter | ⚙️ Exécution migrations |
| `GUIDE_UTILISATION_AUDIT.md` | Ce guide pratique | 🧭 Navigation, méthodologie |

---

## 🚀 Feuille de Route : Les 3 Phases

### Phase 1 : Normalisation (Priorité Haute 🔴)
**Durée estimée** : 1-2 semaines
**Objectif** : Structurer les données de manière cohérente

#### Étape 1.1 : Créer les tables de référence
```bash
# Dans Supabase SQL Editor, exécuter:
# Sections 1 et 2 du fichier OPTIMISATIONS_PRIORITAIRES.sql
```

**Tables créées** :
- ✅ `categories` (10 catégories initiales)
- ✅ `sectors` (8 secteurs d'activité)

**Vérification** :
```sql
SELECT COUNT(*) FROM categories; -- Devrait retourner 10
SELECT COUNT(*) FROM sectors;    -- Devrait retourner 8
```

---

#### Étape 1.2 : Ajouter les colonnes FK (Foreign Keys)
```bash
# Sections 3 à 9 du fichier OPTIMISATIONS_PRIORITAIRES.sql
```

**Colonnes ajoutées** :
- `businesses.category_id` → `categories.id`
- `businesses.city_id` → `cities.id`
- `business_events.city_id` → `cities.id`
- `job_postings.category_id` → `categories.id`
- `job_postings.city_id` → `cities.id`
- `partner_requests.sector_id` → `sectors.id`
- `partner_requests.governorate_id` → `governorates.id`

**Vérification** :
```sql
\d businesses -- Vérifier que category_id et city_id existent
```

---

#### Étape 1.3 : Migrer les données existantes (si applicable)

⚠️ **ATTENTION** : Cette étape ne s'applique que si les tables contiennent déjà des données.

**Script de migration pour `businesses.category`** :
```sql
-- Exemple: Migrer "Restaurant" → categories.id correspondant
UPDATE businesses b
SET category_id = c.id
FROM categories c
WHERE b.category ILIKE c.name_fr
  AND b.category_id IS NULL;

-- Vérifier les enregistrements non migrés
SELECT DISTINCT category
FROM businesses
WHERE category_id IS NULL;
-- → Mapper manuellement les cas non trouvés
```

**Script de migration pour `businesses.city`** :
```sql
-- Migrer les villes vers city_id
UPDATE businesses b
SET city_id = c.id
FROM cities c
WHERE b.city ILIKE c.name_fr
  AND b.city_id IS NULL;

-- Vérifier
SELECT DISTINCT city
FROM businesses
WHERE city_id IS NULL;
```

---

#### Étape 1.4 : Rendre les FK obligatoires (après migration)

⚠️ **Uniquement après avoir migré toutes les données**

```sql
-- Rendre category_id obligatoire
ALTER TABLE businesses
  ALTER COLUMN category_id SET NOT NULL;

-- Rendre city_id obligatoire
ALTER TABLE businesses
  ALTER COLUMN city_id SET NOT NULL;

-- Supprimer les anciennes colonnes texte (optionnel, après validation)
-- ALTER TABLE businesses DROP COLUMN category;
-- ALTER TABLE businesses DROP COLUMN city;
```

---

### Phase 2 : Optimisation Recherche (Priorité Moyenne 🟡)
**Durée estimée** : 2-3 semaines
**Objectif** : Améliorer la performance et la pertinence des recherches

#### Étape 2.1 : Activer le Full-Text Search
```bash
# Sections 10 à 12 du fichier OPTIMISATIONS_PRIORITAIRES.sql
```

**Composants créés** :
- Colonne `search_vector` (tsvector)
- Index GIN pour recherche rapide
- Triggers de mise à jour automatique

**Test de fonctionnement** :
```sql
-- Insérer un business de test
INSERT INTO businesses (name, category_id, city_id, address, phone, email, description, status)
VALUES (
  'Restaurant Test',
  (SELECT id FROM categories WHERE slug = 'restaurant' LIMIT 1),
  (SELECT id FROM cities WHERE name_fr = 'Tunis' LIMIT 1),
  '123 Avenue Habib Bourguiba',
  '+216 12 345 678',
  'test@example.com',
  'Un excellent restaurant tunisien avec des plats traditionnels',
  'approved'
);

-- Vérifier que search_vector est rempli automatiquement
SELECT name, search_vector FROM businesses WHERE name = 'Restaurant Test';

-- Tester la recherche full-text
SELECT name, description
FROM businesses
WHERE search_vector @@ to_tsquery('french', 'restaurant | tunisien')
  AND status = 'approved';
```

---

#### Étape 2.2 : Créer les tables de support
```bash
# Sections 13 et 14 du fichier OPTIMISATIONS_PRIORITAIRES.sql
```

**Tables créées** :
- `keywords` - Synonymes pour améliorer les recherches
- `search_logs` - Logs pour analytics

**Test des synonymes** :
```sql
-- Ajouter un synonyme
INSERT INTO keywords (word, synonyms, language)
VALUES ('pizzeria', ARRAY['restaurant', 'trattoria', 'italien'], 'fr');

-- Requête de test utilisant les synonymes
SELECT k.word, k.synonyms
FROM keywords k
WHERE 'restaurant' = ANY(k.synonyms);
```

---

#### Étape 2.3 : Créer la vue de recherche globale
```bash
# Section 15 du fichier OPTIMISATIONS_PRIORITAIRES.sql
```

**Test de la vue** :
```sql
-- Recherche globale (tous types)
SELECT type, title, city, category
FROM search_global
WHERE title ILIKE '%tunis%'
ORDER BY created_at DESC
LIMIT 10;

-- Compter les résultats par type
SELECT type, COUNT(*) as count
FROM search_global
GROUP BY type;
```

---

### Phase 3 : Performance & Analytics (Priorité Basse 🟢)
**Durée estimée** : 1-2 semaines
**Objectif** : Optimiser les requêtes fréquentes et suivre les statistiques

#### Étape 3.1 : Créer les index composites
```bash
# Section 16 du fichier OPTIMISATIONS_PRIORITAIRES.sql
```

**Validation des performances** :
```sql
-- EXPLAIN ANALYZE pour mesurer l'amélioration
EXPLAIN ANALYZE
SELECT * FROM businesses
WHERE city_id = 'XXX'
  AND category_id = 'YYY'
  AND status = 'approved';

-- Devrait utiliser idx_businesses_city_category_status
```

---

#### Étape 3.2 : Ajouter les colonnes de scoring
```bash
# Section 17 du fichier OPTIMISATIONS_PRIORITAIRES.sql
```

**Utilisation côté application** :
```javascript
// Incrémenter les vues lors de l'affichage
await supabase
  .from('businesses')
  .update({ views_count: supabase.sql`views_count + 1` })
  .eq('id', businessId);

// Récupérer les plus populaires
const { data } = await supabase
  .from('businesses')
  .select('*')
  .eq('status', 'approved')
  .order('search_score', { ascending: false })
  .limit(10);
```

---

#### Étape 3.3 : Logger les recherches pour analytics
```javascript
// Côté application (après chaque recherche)
import { supabase } from './lib/BoltDatabase';

async function logSearch(query, filters, resultsCount) {
  await supabase.from('search_logs').insert({
    query: query,
    filters: filters,
    results_count: resultsCount,
    search_type: 'business',
    language: 'fr',
    execution_time_ms: 150 // Mesuré côté client
  });
}

// Exemple d'utilisation
const results = await searchBusinesses('restaurant', { city: 'Tunis' });
await logSearch('restaurant', { city: 'Tunis' }, results.length);
```

---

## 🔧 Utilisation Pratique dans le Code

### Exemple 1 : Recherche d'entreprises avec full-text

**Avant (texte simple)** :
```javascript
const { data } = await supabase
  .from('businesses')
  .select('*')
  .ilike('name', `%${query}%`)
  .eq('status', 'approved');
```

**Après (full-text optimisé)** :
```javascript
const { data } = await supabase
  .from('businesses')
  .select(`
    *,
    categories(name_fr, icon),
    cities(name_fr, governorates(name_fr))
  `)
  .textSearch('search_vector', query, {
    type: 'websearch',
    config: 'french'
  })
  .eq('status', 'approved')
  .order('search_score', { ascending: false })
  .limit(20);
```

---

### Exemple 2 : Recherche avec filtres normalisés

**Avant (texte libre)** :
```javascript
const { data } = await supabase
  .from('businesses')
  .select('*')
  .eq('category', 'Restaurant') // ⚠️ Sensible à la casse
  .eq('city', 'Tunis');
```

**Après (FK normalisées)** :
```javascript
// 1. Récupérer l'ID de la catégorie
const { data: categories } = await supabase
  .from('categories')
  .select('id')
  .eq('slug', 'restaurant')
  .single();

// 2. Récupérer l'ID de la ville
const { data: cities } = await supabase
  .from('cities')
  .select('id')
  .eq('name_fr', 'Tunis')
  .single();

// 3. Recherche optimisée
const { data } = await supabase
  .from('businesses')
  .select(`
    *,
    categories(name_fr, name_ar, name_en, icon),
    cities(name_fr, name_ar, name_en)
  `)
  .eq('category_id', categories.id)
  .eq('city_id', cities.id)
  .eq('status', 'approved');
```

---

### Exemple 3 : Recherche globale (tous types)

```javascript
const { data } = await supabase
  .from('search_global')
  .select('*')
  .textSearch('search_vector', 'tunis événement', {
    type: 'websearch',
    config: 'french'
  })
  .limit(50);

// Grouper par type
const grouped = data.reduce((acc, item) => {
  if (!acc[item.type]) acc[item.type] = [];
  acc[item.type].push(item);
  return acc;
}, {});

console.log(grouped);
// {
//   business: [...],
//   event: [...],
//   job: [...]
// }
```

---

## 📊 Monitoring & Analytics

### Tableau de bord des recherches populaires

```sql
-- Top 10 des requêtes
SELECT query, COUNT(*) as search_count
FROM search_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 10;

-- Requêtes sans résultats (à améliorer)
SELECT query, COUNT(*) as count
FROM search_logs
WHERE results_count = 0
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY count DESC
LIMIT 10;

-- Performance moyenne des recherches
SELECT
  search_type,
  AVG(execution_time_ms) as avg_time,
  AVG(results_count) as avg_results
FROM search_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY search_type;
```

---

### Top entreprises par popularité

```sql
SELECT
  b.name,
  c.name_fr as category,
  ci.name_fr as city,
  b.views_count,
  b.clicks_count,
  b.search_score
FROM businesses b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN cities ci ON b.city_id = ci.id
WHERE b.status = 'approved'
ORDER BY b.search_score DESC
LIMIT 20;
```

---

## ⚠️ Checklist Avant Mise en Production

### Avant d'exécuter les migrations

- [ ] **Backup de la base** : Créer un snapshot Supabase
- [ ] **Tester sur environnement de dev** : Valider chaque phase
- [ ] **Vérifier les performances** : Comparer avant/après avec EXPLAIN
- [ ] **Planifier un rollback** : Avoir un plan B si problème

### Après les migrations

- [ ] **Mettre à jour le code frontend** : Utiliser les nouvelles FK
- [ ] **Tester toutes les fonctionnalités** : Recherche, filtres, affichage
- [ ] **Monitorer les logs d'erreur** : Pendant 48h après déploiement
- [ ] **Analyser les performances** : Dashboard search_logs

---

## 🆘 Résolution de Problèmes

### Problème 1 : Migration des données échoue

**Symptôme** :
```
ERROR: null value in column "category_id" violates not-null constraint
```

**Solution** :
```sql
-- Ne pas rendre la colonne NOT NULL tout de suite
-- D'abord migrer toutes les données, ensuite:
ALTER TABLE businesses
  ALTER COLUMN category_id SET NOT NULL;
```

---

### Problème 2 : Recherche full-text ne retourne rien

**Symptôme** : La recherche ne trouve aucun résultat

**Vérification** :
```sql
-- Vérifier que search_vector est rempli
SELECT COUNT(*) FROM businesses WHERE search_vector IS NOT NULL;

-- Si vide, forcer la mise à jour
UPDATE businesses SET updated_at = updated_at;
```

---

### Problème 3 : Performances dégradées

**Vérification** :
```sql
-- Analyser les requêtes lentes
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%businesses%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Vérifier que les index sont utilisés
EXPLAIN ANALYZE
SELECT * FROM businesses WHERE category_id = 'XXX';
```

---

## 📚 Ressources Complémentaires

### Documentation Supabase
- [Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [Indexes](https://supabase.com/docs/guides/database/indexes)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Documentation PostgreSQL
- [tsvector & tsquery](https://www.postgresql.org/docs/current/textsearch.html)
- [GIN Index](https://www.postgresql.org/docs/current/gin.html)
- [EXPLAIN ANALYZE](https://www.postgresql.org/docs/current/sql-explain.html)

---

## 🎓 Bonnes Pratiques

### 1. Toujours tester en dev d'abord
```bash
# Créer un environnement de test
# Exécuter les migrations
# Valider les résultats
# Puis seulement déployer en prod
```

### 2. Utiliser des transactions pour les migrations critiques
```sql
BEGIN;
  -- Migration 1
  -- Migration 2
  -- Vérifications
COMMIT; -- ou ROLLBACK en cas de problème
```

### 3. Monitorer les performances après chaque phase
```javascript
// Logger les temps de réponse
console.time('search');
const results = await searchBusinesses('restaurant');
console.timeEnd('search');
```

---

## 📝 Notes Finales

Ce guide est un **document vivant** qui doit être mis à jour au fur et à mesure de l'implémentation des optimisations.

**Prochaines étapes recommandées** :
1. ✅ Lire le rapport d'audit complet (`AUDIT_DATABASE_SUPABASE.md`)
2. ✅ Exécuter Phase 1 (Normalisation)
3. ✅ Mettre à jour le code frontend
4. ✅ Exécuter Phase 2 (Recherche)
5. ✅ Implémenter l'analytics
6. ✅ Exécuter Phase 3 (Performance)

**Contact Support** :
- 📧 Pour toute question sur l'audit ou les optimisations
- 💬 Créer une issue GitHub avec le tag `[Database]`

---

*Document créé le 20 octobre 2025*
*Basé sur l'audit de la base Supabase - Dalil Tounes*
