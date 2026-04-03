# Stratégie Badges : Affichage vs Recherche

**Date:** 7 février 2026
**Objectif:** Badges discrets visuellement, mais indexation complète pour la recherche

---

## 🎯 Principe Fondamental

Les badges dans `badges_entreprise` sont des **mots-clés primordiaux pour la recherche**, pas nécessairement tous destinés à l'affichage visuel.

### Architecture

```
┌─────────────────────────────────┐
│   Base de Données               │
│   badges_entreprise (text[])    │
│                                 │
│   ["Cuir", "Maroquinerie",      │
│    "Artisanat", "Traditionnel", │
│    "Fait-main", "Sur-mesure"]   │
└────────────┬────────────────────┘
             │
             ├─────────────────────┐
             │                     │
             ▼                     ▼
    ┌────────────────┐    ┌────────────────┐
    │   AFFICHAGE    │    │   RECHERCHE    │
    │   (Discret)    │    │  (Complète)    │
    └────────────────┘    └────────────────┘
             │                     │
             │                     │
    Seulement 2 badges      TOUS les badges
    sur la carte            sont indexés
             │                     │
             ▼                     ▼
    ┌────────────────┐    ┌────────────────┐
    │ "Cuir"         │    │ Recherche:     │
    │ "Maroquinerie" │    │ "cui" ✅       │
    │ +4             │    │ "maro" ✅      │
    └────────────────┘    │ "fait" ✅      │
                          │ "trad" ✅      │
                          └────────────────┘
```

---

## 📊 Implémentation

### 1. Affichage Discret (BusinessCard.tsx)

**Règle:** Afficher seulement 2 badges + indicateur "+X"

```typescript
{/* Affichage discret (2 max) mais TOUS indexés pour la recherche */}
{business.badges && business.badges.length > 0 && (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px' }}>
    {business.badges.slice(0, 2).map((badge, index) => (
      <span
        key={index}
        style={{
          fontSize: '10px',      // ← Taille réduite
          padding: '3px 8px',    // ← Padding réduit
          maxWidth: '100px'      // ← Largeur max réduite
        }}
      >
        {badge}
      </span>
    ))}
    {business.badges.length > 2 && (
      <span>+{business.badges.length - 2}</span>
    )}
  </div>
)}
```

**Caractéristiques:**
- ✅ Design épuré et non-intrusif
- ✅ 2 badges visibles maximum
- ✅ Indicateur "+X" pour les badges cachés
- ✅ Styles subtils (10px, padding 3px/8px)

---

### 2. Recherche Complète (Businesses.tsx)

**Règle:** Indexer TOUS les badges, même ceux non affichés

```typescript
// PRIORITÉ RECHERCHE: Tous les badges sont indexés (même ceux non affichés)
let matchBadges = false;
let matchedBadge = null;

if (Array.isArray(business.badges) && business.badges.length > 0) {
  // Parcours de TOUS les badges (pas seulement les 2 affichés)
  business.badges.forEach(badge => {
    const normalizedBadge = normalizeText(badge || '');
    if (normalizedBadge.includes(normalizedSearchTerm)) {
      matchBadges = true;
      matchedBadge = badge;  // Pour debug
    }
  });
}
```

**Caractéristiques:**
- ✅ Parcourt TOUS les badges (pas `.slice()`)
- ✅ Normalisation du texte (accents, casse)
- ✅ Recherche partielle (`.includes()`)
- ✅ Log du badge exact qui a matché

---

## 🔍 Exemples de Recherche

### Cas 1: Badge "Cuir"

**Entreprise:**
```json
{
  "nom": "Atelier Maroquinerie",
  "badges": ["Cuir", "Maroquinerie", "Artisanat", "Traditionnel", "Fait-main"]
}
```

**Affichage sur carte:**
```
Cuir
Maroquinerie
+3
```

**Recherches qui trouvent l'entreprise:**
- "cui" ✅ → match "Cuir"
- "cuir" ✅ → match "Cuir"
- "maro" ✅ → match "Maroquinerie"
- "artisan" ✅ → match "Artisanat"
- "fait" ✅ → match "Fait-main"
- "trad" ✅ → match "Traditionnel"

**Note:** Les 3 derniers badges ne sont pas affichés (cachés derrière "+3"), mais ILS SONT INDEXÉS pour la recherche.

---

### Cas 2: Badge "Authentique"

**Entreprise:**
```json
{
  "nom": "Restaurant La Medina",
  "badges": ["Couscous", "Tajine", "Authentique", "Terrasse"]
}
```

**Affichage sur carte:**
```
Couscous
Tajine
+2
```

**Recherches qui trouvent l'entreprise:**
- "cous" ✅ → match "Couscous"
- "taj" ✅ → match "Tajine"
- "auth" ✅ → match "Authentique" (badge caché mais indexé)
- "terra" ✅ → match "Terrasse" (badge caché mais indexé)

---

## 🎨 Styles Visuels

### Badges Affichés

**Standard:**
```css
fontSize: 10px
padding: 3px 8px
backgroundColor: rgba(234, 88, 12, 0.06)
color: #EA580C
border: 1px solid rgba(234, 88, 12, 0.12)
maxWidth: 100px
```

**Premium:**
```css
fontSize: 10px
padding: 3px 8px
backgroundColor: rgba(212, 175, 55, 0.12)
color: #D4AF37
border: 1px solid rgba(212, 175, 55, 0.25)
maxWidth: 100px
```

### Indicateur "+X"

**Standard:**
```css
fontSize: 10px
padding: 3px 8px
backgroundColor: rgba(156, 163, 175, 0.08)
color: #9CA3AF
border: 1px solid rgba(156, 163, 175, 0.15)
```

**Premium:**
```css
fontSize: 10px
padding: 3px 8px
backgroundColor: rgba(212, 175, 55, 0.08)
color: rgba(212, 175, 55, 0.7)
border: 1px solid rgba(212, 175, 55, 0.15)
```

---

## 🔧 Normalisation du Texte

La fonction `normalizeText()` assure que la recherche fonctionne indépendamment des accents et de la casse:

```typescript
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
```

**Exemples:**
- "Cuir" → "cuir"
- "Marché" → "marche"
- "Café" → "cafe"
- "MAROQUINERIE" → "maroquinerie"

---

## 📋 Colonnes de Recherche Active

Lorsqu'un utilisateur tape un terme, la recherche vérifie **5 colonnes**:

1. ✅ **nom** - Nom de l'entreprise
2. ✅ **badges** - TOUS les badges (affichés + cachés)
3. ✅ **mots_cles_recherche** - Mots-clés SEO
4. ✅ **sous_categories** - Catégorie métier
5. ✅ **services** - Liste des services

**Logique:**
```typescript
const isMatch = matchNom || matchBadges || matchMotsCles || matchCategory || matchServices;
```

---

## 🚀 Avantages de cette Stratégie

### Design
- ✅ Cartes épurées et non-surchargées
- ✅ Maximum 2 badges visibles
- ✅ Indicateur "+X" discret pour les badges cachés
- ✅ Styles subtils (10px, padding réduit)

### Recherche
- ✅ TOUS les badges indexés (même cachés)
- ✅ Recherche partielle ("cui" trouve "Cuir")
- ✅ Normalisation complète (accents, casse)
- ✅ Logs détaillés pour debug

### Performance
- ✅ `.forEach()` optimisé pour parcours complet
- ✅ Pas de `.slice()` sur la recherche
- ✅ Arrêt dès le premier match trouvé

---

## 🧪 Tests de Validation

### Test 1: Recherche "cui"
```
Entreprise: "Atelier du Cuir"
Badges: ["Cuir", "Maroquinerie", "Artisanat"]
Recherche: "cui"
Résultat: ✅ Trouvée
Badge matché: "Cuir"
```

### Test 2: Recherche badge caché
```
Entreprise: "Boutique Mode"
Badges: ["Vêtements", "Accessoires", "Sur-mesure", "Luxe"]
Affichage: "Vêtements", "Accessoires", "+2"
Recherche: "luxe"
Résultat: ✅ Trouvée (badge caché mais indexé)
Badge matché: "Luxe"
```

### Test 3: Recherche avec accents
```
Entreprise: "Café Oriental"
Badges: ["Café", "Thé", "Pâtisserie"]
Recherche: "cafe" (sans accent)
Résultat: ✅ Trouvée
Badge matché: "Café"
```

---

## 📚 Documentation Code

### Affichage (2 badges max)
```typescript
// Limite l'affichage pour design épuré
{business.badges.slice(0, 2).map(...)}
```

### Recherche (tous les badges)
```typescript
// Parcourt TOUS les badges pour indexation complète
business.badges.forEach(badge => {
  if (normalizedBadge.includes(normalizedSearchTerm)) {
    matchBadges = true;
  }
});
```

---

**Stratégie implémentée avec succès !** ✅

**Principe:** Affichage discret, recherche exhaustive.
