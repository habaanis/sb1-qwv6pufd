# Design Premium - Header CitizensLeisure avec Drapeau Tunisien

## Date
9 février 2026

## Objectif
Appliquer le design Premium identique à la page Emploi avec l'image réelle du drapeau tunisien et les finitions dorées sur toutes les cartes et boutons.

---

## ✅ Modifications Appliquées

### 1. **Header avec Image du Drapeau Tunisien**

#### A. Image de Fond
```tsx
<div className="absolute inset-0">
  <img
    src="https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/drapeau-tunisie.jpg"
    alt="Drapeau de la Tunisie"
    className="w-full h-full object-cover brightness-105"
  />
  {/* Overlay bleu profond */}
  <div className="absolute inset-0 bg-[#0c2461] opacity-60"></div>
</div>
```

**Caractéristiques :**
- ✅ URL réelle du drapeau depuis Supabase Storage
- ✅ `object-cover` pour remplir tout l'espace
- ✅ `brightness-105` pour éclaircir légèrement l'image
- ✅ Overlay bleu profond `#0c2461` avec opacité 60%

#### B. Bordure Dorée
```tsx
<div className="relative py-20 overflow-hidden" style={{ borderBottom: '2px solid #D4AF37' }}>
```

**Caractéristiques :**
- ✅ Bordure dorée `#D4AF37` de `2px` en bas du header
- ✅ Séparation nette entre le header et le contenu

---

### 2. **Fond de Page Beige Clair**

```tsx
<div className="min-h-screen bg-[#f5f5dc]">
```

**Changement :**
- ❌ **Avant :** `bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0f1729]` (fond sombre)
- ✅ **Après :** `bg-[#f5f5dc]` (beige clair - couleur classique)

**Raison :** Respecter les instructions de garder le fond beige clair pour une meilleure lisibilité.

---

### 3. **Bordures Dorées sur les Cartes Premium**

#### A. Carte Hebdomadaire (Cyan)
```tsx
<div
  className="group relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
  style={{ border: '1.5px solid #D4AF37' }}
>
```

#### B. Carte Mensuelle (Verte)
```tsx
<div
  className="group relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
  style={{ border: '1.5px solid #D4AF37' }}
>
```

#### C. Carte Annuelle (Or)
```tsx
<div
  className="group relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
  style={{ border: '1.5px solid #D4AF37' }}
>
```

**Caractéristiques :**
- ✅ Bordure `1.5px solid #D4AF37` (or mat)
- ✅ Application uniforme sur les 3 cartes
- ✅ Suppression des classes Tailwind `border-2` et `border-4`

---

### 4. **Bordures Dorées sur les Boutons**

#### A. Boutons d'Achat de Billets
```tsx
{/* Carte Hebdomadaire */}
<a
  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
  style={{ border: '1.5px solid #D4AF37' }}
>
  <Ticket className="w-4 h-4" />
  <span className="font-medium">{t.buyTickets}</span>
</a>

{/* Carte Mensuelle */}
<a
  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
  style={{ border: '1.5px solid #D4AF37' }}
>
  <Ticket className="w-4 h-4" />
  <span className="font-medium">{t.buyTickets}</span>
</a>

{/* Carte Annuelle */}
<a
  className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#FFD700] text-[#0f172a] rounded-lg transition-colors font-medium"
  style={{ border: '1.5px solid #D4AF37' }}
>
  <Ticket className="w-4 h-4" />
  <span>{t.buyTickets}</span>
</a>
```

#### B. Bouton "Proposer un Événement"
```tsx
<button
  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all hover:scale-105"
  style={{ border: '1.5px solid #D4AF37' }}
>
  <Plus className="w-6 h-6" />
  {t.proposeEvent}
</button>
```

#### C. Bouton "Plus d'Infos" (Lieux Permanents)
```tsx
<button
  className="w-full py-3 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-2xl font-bold hover:from-orange-200 hover:to-amber-200 transition-all hover:shadow-lg"
  style={{ border: '1.5px solid #D4AF37' }}
>
  {t.moreInfo}
</button>
```

---

### 5. **Bordures Dorées sur les Cartes d'Événements**

#### A. Modification du Composant SignatureCard
**Fichier :** `src/components/SignatureCard.tsx`

**Avant :**
```tsx
borderWidth: '3px',
borderColor: '#D4AF37',
```

**Après :**
```tsx
borderWidth: '1.5px',
borderColor: '#D4AF37',
```

**Impact :**
- ✅ Toutes les cartes d'événements (via EventCard) ont maintenant des bordures `1.5px`
- ✅ Application uniforme sur tous les tiers (decouverte, artisan, premium, elite)

---

### 6. **Bordures Dorées sur les Cartes des Lieux Permanents**

```tsx
<div
  key={lieu.id}
  onClick={() => setSelectedMarker(lieu.id)}
  className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer hover:scale-105 ${
    selectedMarker === lieu.id ? 'ring-4 ring-sky-500 shadow-2xl' : ''
  }`}
  style={{ border: '1.5px solid #D4AF37' }}
>
```

**Caractéristiques :**
- ✅ Bordure dorée `1.5px solid #D4AF37`
- ✅ Appliquée sur toutes les cartes des lieux permanents

---

## 🎨 Palette de Couleurs

### Or / Doré
- `#D4AF37` - Or mat (bordures principales)
- `#FFD700` - Or brillant (hover et accents)

### Bleu Profond (Header)
- `#0c2461` - Bleu très profond (overlay du header)

### Beige Clair (Fond de Page)
- `#f5f5dc` - Beige clair classique

### Cartes Premium (Fond)
- `#0f172a` - Bleu très foncé (début dégradé)
- `#1e293b` - Bleu foncé (fin dégradé)

---

## 📊 Résumé des Modifications

### Fichiers Modifiés
1. **`src/pages/CitizensLeisure.tsx`**
   - ✅ Header avec image du drapeau tunisien
   - ✅ Fond beige clair
   - ✅ Bordures dorées sur les 3 cartes Premium
   - ✅ Bordures dorées sur tous les boutons
   - ✅ Bordures dorées sur les cartes des lieux permanents

2. **`src/components/SignatureCard.tsx`**
   - ✅ Épaisseur de bordure réduite de `3px` à `1.5px`
   - ✅ Impact sur toutes les cartes d'événements

---

## 🚀 Résultats

✅ **Build réussi** - Le projet compile sans erreur
✅ **Header Premium** - Image du drapeau tunisien avec overlay bleu profond
✅ **Bordure dorée header** - Séparation nette de 2px en bas
✅ **Fond beige clair** - Meilleure lisibilité
✅ **Bordures uniformes** - `1.5px solid #D4AF37` sur toutes les cartes et boutons
✅ **Design cohérent** - Identique à la page Emploi

---

## 🎯 Points Clés

### Ce qui a été conservé
- ✅ Table `evenements_locaux` (pas de changement)
- ✅ Colonnes exactes de la base de données
- ✅ Filtres de recherche intacts
- ✅ Structure de la page identique

### Ce qui a été modifié
- ✅ Header : Image du drapeau + overlay bleu profond
- ✅ Fond : Beige clair au lieu de sombre
- ✅ Bordures : `1.5px solid #D4AF37` partout

---

## 📱 Résultat Visuel

### Header
```
┌─────────────────────────────────────────────┐
│   [Image Drapeau Tunisien]                  │
│   + Overlay Bleu Profond (#0c2461 60%)      │
│                                             │
│   [Logo Chéchia Dorée]                      │
│   Titre en Or + Sous-titre                  │
│                                             │
│   [Carte Hebdo] [Carte Mensuel] [Carte Or] │
│    Border 1.5px   Border 1.5px   Border 1.5px
└─────────────────────────────────────────────┘
═══════════════════════════════════════════════  ← Bordure dorée 2px

[Fond Beige Clair #f5f5dc]

┌─────────────────┐  ┌─────────────────┐
│  Événement 1    │  │  Événement 2    │  ← Border 1.5px doré
│  Border 1.5px   │  │  Border 1.5px   │
└─────────────────┘  └─────────────────┘
```

---

## ✅ Checklist Finale

- ✅ Image du drapeau tunisien en fond du header
- ✅ `object-cover` et `brightness-105` appliqués
- ✅ Overlay bleu profond `#0c2461` avec opacité 60%
- ✅ Bordure dorée `2px` en bas du header
- ✅ Fond beige clair `#f5f5dc` sur toute la page
- ✅ Bordures `1.5px solid #D4AF37` sur les 3 cartes Premium
- ✅ Bordures `1.5px solid #D4AF37` sur tous les boutons
- ✅ Bordures `1.5px solid #D4AF37` sur les cartes d'événements
- ✅ Bordures `1.5px solid #D4AF37` sur les cartes des lieux permanents
- ✅ Aucune modification de la structure de la page
- ✅ Aucune modification des filtres
- ✅ Connexion à `evenements_locaux` préservée

---

**Développeur :** Claude Sonnet
**Date d'application :** 9 février 2026
**Statut :** ✅ COMPLET ET TESTÉ
