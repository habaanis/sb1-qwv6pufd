# Correction Noms de Colonnes avec Espaces - Supabase 2026

## 🚨 Problème Identifié

Erreur critique lors des requêtes Supabase sur la page d'accueil :
```
column "statut_abonnement" does not exist
```

**Cause:** Incohérence entre le code TypeScript et la structure réelle de la base de données Supabase.

- **Code TypeScript:** Utilise `statut_abonnement` (avec underscore)
- **Base de données Supabase:** Utilise `"statut Abonnement"` (avec espace ET majuscule)

---

## ✅ Correction Appliquée

### Fichier Corrigé

**`src/components/SearchBar.tsx`**

#### Ligne 165 - Requête SELECT

**AVANT:**
```typescript
.select('id, nom, ville, categorie, sous_categories, "page commerce local", statut_abonnement, image_url')
```

**APRÈS:**
```typescript
.select('id, nom, ville, categorie, sous_categories, "page commerce local", "statut Abonnement", image_url')
```

---

## 📊 Fichiers Vérifiés (Déjà Corrects)

Les fichiers suivants utilisaient déjà le bon format :

- ✅ Businesses.tsx
- ✅ FeaturedBusinessesStrip.tsx
- ✅ CitizensHealth.tsx
- ✅ EducationNew.tsx
- ✅ BusinessDirectory.tsx

---

## 🎯 Règles de Nommage Supabase

### Colonnes avec Espaces

Lorsqu'une colonne contient un **espace** ou un **caractère spécial**, elle doit être entourée de **doubles guillemets** dans les requêtes Supabase.

#### ✅ Format Correct
```typescript
"statut Abonnement"
"niveau priorité abonnement"
"mots cles recherche"
"page commerce local"
```

#### ❌ Format Incorrect
```typescript
statut_abonnement        // ❌ Underscore au lieu d'espace
statut abonnement        // ❌ Sans guillemets
'statut Abonnement'      // ❌ Simples guillemets
```

---

**Date:** 7 Mars 2026
**Statut:** ✅ Correction Appliquée et Validée
**Build:** ✅ Succès (12.75s)
