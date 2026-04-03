# Correction Recherche Entreprises - Février 2026

**Date:** 2026-02-07
**Problème:** Erreur dans le `.select()` après ajout de la colonne `services`
**Cause:** Noms de colonnes avec espaces non gérés correctement

---

## 🔍 Diagnostic

### Problème Identifié
La requête Supabase cassait car les noms de colonnes dans la base contiennent des **espaces et majuscules**, mais le code utilisait des noms en **snake_case**.

### Colonnes Problématiques

| Nom utilisé dans le code | Nom réel dans Supabase | Type |
|---------------------------|------------------------|------|
| `statut_abonnement` | `"Statut Abonnement"` | text |
| `lien_instagram` | `"Lien Instagram"` | text |
| `lien_facebook` | `"lien facebook"` | text |
| `lien_tiktok` | `"Lien TikTok"` | text |
| `lien_linkedin` | `"Lien LinkedIn"` | text |
| `lien_youtube` | `"Lien YouTube"` | text |

### Erreur de Syntaxe
```typescript
// ❌ AVANT (cassé)
.select('..., statut_abonnement, lien_instagram, ...')

// ✅ APRÈS (corrigé)
.select('..., "Statut Abonnement", "Lien Instagram", ...')
```

---

## ✅ Corrections Appliquées

### 1. Correction du `.select()` (2 occurrences)

**Fichier:** `src/pages/Businesses.tsx`

#### Dans `fetchBusinesses()` et `performSearch()`
```typescript
let query = supabase
  .from(Tables.ENTREPRISE)
  .select('id, nom, secteur, sous_categories, categorie, gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, "Statut Abonnement", tags, mots_cles_recherche, "Lien Instagram", "lien facebook", "Lien TikTok", "Lien LinkedIn", "Lien YouTube"')
  .order('nom', { ascending: true })
  .limit(200);
```

**Points clés:**
- ✅ Guillemets doubles autour des colonnes avec espaces
- ✅ Respect des majuscules/minuscules
- ✅ Colonne `services` sans guillemets (pas d'espace)
- ✅ Pas de virgule en trop

---

### 2. Correction du Mapping (2 occurrences)

**Avant:**
```typescript
statut_abonnement: item.statut_abonnement || null,
instagram: item.lien_instagram || '',
```

**Après:**
```typescript
statut_abonnement: item['Statut Abonnement'] || null,
instagram: item['Lien Instagram'] || '',
facebook: item['lien facebook'] || '',
tiktok: item['Lien TikTok'] || '',
linkedin: item['Lien LinkedIn'] || '',
youtube: item['Lien YouTube'] || '',
```

**Points clés:**
- ✅ Utilisation de la notation bracket `item['Nom Colonne']`
- ✅ Fallback avec `|| null` ou `|| ''` pour éviter les erreurs sur valeurs null
- ✅ Mapping cohérent dans `fetchBusinesses()` et `performSearch()`

---

### 3. Correction du Filtre Premium

**Avant:**
```typescript
query = query.or('statut_abonnement.ilike.%elite%,statut_abonnement.ilike.%premium%,statut_abonnement.ilike.%artisan%');
```

**Après:**
```typescript
query = query.or('"Statut Abonnement".ilike.%elite%,"Statut Abonnement".ilike.%premium%,"Statut Abonnement".ilike.%artisan%');
```

**Points clés:**
- ✅ Guillemets doubles autour de `"Statut Abonnement"` dans le filtre OR
- ✅ Syntaxe correcte pour les opérateurs `.ilike`

---

### 4. Vérification du Fallback Services

**Code déjà correct:**
```typescript
const matchServices = business.services
  ? normalizeText(business.services).includes(normalizedSearchTerm)
  : false;
```

**Points clés:**
- ✅ Vérification ternaire pour éviter les erreurs sur `null`
- ✅ Pas besoin de `(business.services || '')` car déjà géré dans le mapping
- ✅ Retourne `false` si `services` est `null` ou vide

---

## 📊 Résultats

### Build
```bash
✓ 2070 modules transformed
✓ built in 14.47s
✅ Aucune erreur TypeScript
✅ Aucune erreur de syntaxe
```

### Fonctionnalités Testées
1. ✅ Chargement liste entreprises (`fetchBusinesses()`)
2. ✅ Recherche par mot-clé (`performSearch()`)
3. ✅ Recherche dans la colonne `services`
4. ✅ Filtre par gouvernorat
5. ✅ Filtre par catégorie
6. ✅ Filtre Premium (Elite/Premium/Artisan)
7. ✅ Tri par priorité d'abonnement

### Colonnes Recherchées (Multi-colonnes)
- ✅ `nom` (nom de l'entreprise)
- ✅ `tags` (tableau de tags)
- ✅ `mots_cles_recherche` (mots-clés)
- ✅ `sous_categories` (catégorie)
- ✅ `services` (nouveauté - liste des services)

---

## 🎯 Points Validés

### Sécurité des Données
- ✅ Fallback `|| null` pour les champs optionnels
- ✅ Fallback `|| ''` pour les chaînes
- ✅ Fallback `|| []` pour les tableaux (tags)
- ✅ Vérification `Array.isArray(business.tags)` avant `.some()`

### Performance
- ✅ Index sur `"Statut Abonnement"` (si créé via migration)
- ✅ Limite de 200 résultats
- ✅ Tri optimisé par priorité d'abonnement
- ✅ Debounce de 250ms sur la recherche

### Compatibilité
- ✅ Gestion des espaces dans les noms de colonnes
- ✅ Respect des majuscules/minuscules
- ✅ Compatible avec la structure Airtable sync

---

## 📝 Notes Importantes

### Nommage des Colonnes
La base Supabase contient des colonnes avec espaces car elle est synchronisée depuis Airtable. Pour éviter ce type d'erreur à l'avenir :

1. **Toujours vérifier** le nom exact des colonnes dans Supabase
2. **Utiliser des guillemets doubles** pour les colonnes avec espaces
3. **Utiliser la notation bracket** dans le mapping : `item['Nom Colonne']`

### Migration Future
Il serait idéal de renommer les colonnes sans espaces, mais cela nécessiterait :
- Modifier la synchronisation Airtable
- Créer une migration SQL pour renommer les colonnes
- Mettre à jour tout le code existant

**Décision:** Garder les noms actuels pour maintenir la compatibilité avec Airtable.

---

## ✅ Checklist de Validation

- [x] Correction du `.select()` avec guillemets
- [x] Correction du mapping avec bracket notation
- [x] Correction du filtre premium
- [x] Vérification des fallbacks
- [x] Build sans erreurs
- [x] Tests fonctionnels
- [x] Documentation

---

**Recherche réparée et opérationnelle !** ✅
