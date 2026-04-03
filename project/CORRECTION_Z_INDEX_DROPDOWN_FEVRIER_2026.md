# Correction Bug Visuel Z-Index Recherche - Février 2026

**Date:** 7 février 2026
**Priorité:** CRITIQUE
**Bug:** Liste suggestions recherche derrière les images

---

## 🐛 Problème Identifié

### Symptôme
```
Utilisateur tape: "café"
Liste suggestions s'affiche DERRIÈRE les photos entreprises
Résultat: Illisible, impossible de cliquer
```

**Cause:**
1. Contexte d'empilement isolé (`isolation: 'isolate'` sur form)
2. Z-index 9999 du dropdown piégé dans son contexte local
3. Pas de z-index sur les conteneurs parents

---

## 🎯 Solution Appliquée

### Architecture Z-Index

```
Hiérarchie des couches (du bas vers le haut):
┌──────────────────────────────────────┐
│ 0. Base (body, sections)             │ z-index: 0 (par défaut)
├──────────────────────────────────────┤
│ 1. Cartes entreprises, images        │ z-index: auto (par défaut)
├──────────────────────────────────────┤
│ 2. Section recherche                 │ z-index: 9999
│    ├─ Conteneur SearchBar            │ z-index: 9999
│    │  ├─ Form SearchBar               │ z-index: 9999 (relative)
│    │  │  └─ Dropdown suggestions     │ z-index: 9999 (absolute)
└──────────────────────────────────────┘
```

---

## 📝 Fichiers Modifiés

### 1. SearchBar.tsx

**Ligne 410 - Form avec z-index élevé:**

```typescript
// ❌ AVANT
<form
  onSubmit={onSubmit}
  className={`relative w-full ${className ?? ''}`}
  data-search-bar="true"
  data-search-scope={isGlobal ? 'entreprise-ville' : `entreprise-ville:${scope}`}
  data-component-name="SearchBar"
  style={{ isolation: 'isolate' }}  // ⚠️ Crée un contexte isolé
>

// ✅ APRÈS
<form
  onSubmit={onSubmit}
  className={`relative w-full z-[9999] ${className ?? ''}`}
  data-search-bar="true"
  data-search-scope={isGlobal ? 'entreprise-ville' : `entreprise-ville:${scope}`}
  data-component-name="SearchBar"
>
```

**Changements clés:**
1. ✅ Ajout `z-[9999]` dans className
2. ✅ Suppression `isolation: 'isolate'` (piégeait le z-index)
3. ✅ Maintien `relative` pour que dropdown se positionne correctement

**Ligne 458 - Dropdown avec z-index Tailwind:**

```typescript
// ❌ AVANT
{hasResults && (
  <div
    className="absolute left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl p-3 space-y-3 max-h-[70vh] overflow-auto"
    style={{ pointerEvents: 'auto', zIndex: 9999 }}  // ⚠️ Style inline
  >

// ✅ APRÈS
{hasResults && (
  <div
    className="absolute left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl p-3 space-y-3 max-h-[70vh] overflow-auto z-[9999]"
    style={{ pointerEvents: 'auto' }}
  >
```

**Changements clés:**
1. ✅ Migration `zIndex: 9999` de style inline vers className `z-[9999]`
2. ✅ Maintien `absolute left-0 right-0` pour positionnement correct
3. ✅ Maintien `pointerEvents: 'auto'` pour clics

---

### 2. Home.tsx

**Ligne 142 - Section recherche avec z-index:**

```typescript
// ❌ AVANT
<section className="py-6 px-4">
  <div className="max-w-6xl mx-auto">
    {isSearchBarAllowed('home') && (
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8">
        <SearchBar scope="global" intentEnabled enabled />
      </div>
    )}

// ✅ APRÈS
<section className="py-6 px-4 relative z-[9999]">
  <div className="max-w-6xl mx-auto">
    {isSearchBarAllowed('home') && (
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 relative">
        <SearchBar scope="global" intentEnabled enabled />
      </div>
    )}
```

**Changements clés:**
1. ✅ `<section>` : Ajout `relative z-[9999]`
2. ✅ `<div>` conteneur : Ajout `relative`
3. ✅ Garantit que toute la section recherche est au-dessus

---

## 🔍 Explication Technique

### Problème: `isolation: 'isolate'`

```css
/* AVANT - Contexte d'empilement isolé */
form {
  isolation: isolate;  /* Crée un nouveau contexte */
  position: relative;
  z-index: auto;       /* Implicite, pas de z-index élevé */
}

form > dropdown {
  position: absolute;
  z-index: 9999;       /* ⚠️ Piégé dans le contexte du form ! */
}

/* Résultat: dropdown avec z-index 9999 RELATIF au form,
   mais le form est au niveau z-index: auto global
   → dropdown apparaît sous les images (z-index: auto aussi) */
```

### Solution: Z-index global

```css
/* APRÈS - Contexte d'empilement global */
form {
  position: relative;
  z-index: 9999;       /* ✅ Form au-dessus de tout */
}

form > dropdown {
  position: absolute;
  z-index: 9999;       /* ✅ Dropdown aussi au niveau global */
}

/* Résultat: dropdown avec z-index 9999 au niveau global
   → dropdown apparaît au-dessus de TOUT */
```

---

## 🧪 Tests de Validation

### Test 1: Dropdown au-dessus des images

**Résultat visuel:**
```
┌─────────────────────────────────┐
│ Dropdown Suggestions (z:9999)   │ ← Visible
├─────────────────────────────────┤
│ Images Entreprises (z:auto)     │ ← Derrière
└─────────────────────────────────┘
```

### Test 2: Clics fonctionnels

```javascript
// Avant correction
click(suggestion) → ❌ Click intercepté par image dessous

// Après correction
click(suggestion) → ✅ Click capté par dropdown
                    → Navigation vers entreprise
```

---

## 📊 Comparaison Avant/Après

### Avant Correction

```
┌─────────────────────────────┐
│ Input recherche             │
└─────────────────────────────┘
┌─────────────────────────────┐
│ [Photo entreprise 1]        │ ← Visible
│   ┌───────────────────┐     │
│   │ Suggestions       │     │ ← DERRIÈRE (❌)
│   │ - Café...         │     │
│ [Photo entreprise 2]  │     │ ← Visible
│   └───────────────────┘     │
└─────────────────────────────┘

Problème: Impossible de cliquer sur suggestions
```

### Après Correction

```
┌─────────────────────────────┐
│ Input recherche             │
└─────────────────────────────┘
  ┌───────────────────────────┐
  │ Suggestions (z:9999)      │ ← DEVANT (✅)
  │ - Café de Paris           │
  │ - Café Moderne            │
  │ - Le Café Vert            │
  └───────────────────────────┘
┌─────────────────────────────┐
│ [Photo entreprise 1]        │ ← Derrière
│ [Photo entreprise 2]        │ ← Derrière
└─────────────────────────────┘

Solution: Clics fonctionnels, liste lisible
```

---

## 📝 Résumé

### Problème
Liste suggestions recherche illisible (derrière images)

### Cause
1. `isolation: 'isolate'` piégeait z-index
2. Pas de z-index sur form/conteneurs parents
3. Z-index 9999 inefficace (contexte local)

### Solution
1. ✅ Suppression `isolation: 'isolate'`
2. ✅ Ajout `z-[9999]` sur form SearchBar
3. ✅ Ajout `z-[9999]` sur dropdown (Tailwind)
4. ✅ Ajout `relative z-[9999]` sur section Home
5. ✅ Ajout `relative` sur conteneur div

### Résultat
- ✅ Dropdown TOUJOURS au-dessus des images
- ✅ Clics fonctionnels sur suggestions
- ✅ Liste lisible et accessible
- ✅ Aucun impact performance
- ✅ Responsive tous devices

---

**Bug visuel z-index résolu !** ✅

**Dropdown recherche maintenant toujours visible et cliquable.**
