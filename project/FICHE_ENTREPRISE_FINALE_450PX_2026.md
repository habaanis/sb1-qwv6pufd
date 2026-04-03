# Fiche Entreprise Finale - Format 450px Verrouillé
**Date : Mars 2026**

## Vue d'Ensemble

Carte d'entreprise ultra-compacte, **450px de largeur maximale**, **zéro scroll horizontal**, avec couleurs dynamiques selon le tier d'abonnement.

---

## 🎨 Système de Couleurs Dynamiques par Tier

### Elite (Prestige Maximum)
```javascript
background: '#000000'  // Noir profond
border: '#D4AF37'      // Or
gold: '#D4AF37'        // Or
```

### Premium (Vert émeraude)
```javascript
background: '#064E3B'  // Vert émeraude foncé
border: '#D4AF37'      // Or
gold: '#D4AF37'        // Or
```

### Artisan (Bordeaux)
```javascript
background: '#7F1D1D'  // Bordeaux profond
border: '#DC2626'      // Rouge
gold: '#DC2626'        // Rouge
```

---

## 📐 Structure de la Carte (450px)

```
┌────────────────────────────────────────┐
│  [Photo Bannière - 120px hauteur]     │ ← w-full, overflow-hidden
├────────────────────────────────────────┤
│       🔴 Logo rond (-mt-10)            │ ← Border couleur tier
│                                        │
│     ★ NOM ENTREPRISE ★                │ ← Truncate
│     Catégorie (couleur tier)          │ ← Truncate
│                                        │
│  📍 Ville | ☎️ Téléphone               │ ← Truncate, couleur tier
│                                        │
│  Description (2 lignes max)           │ ← Line-clamp-2, break-words
│                                        │
│  ⏰ [Horaires] (Accordéon)            │ ← Border couleur tier
│     └─ Lundi    : 09:00-18:00        │ ← text-[9px], truncate
│     └─ Mardi    : 09:00-18:00        │
│                                        │
├────────────────────────────────────────┤
│  📧 📷 📘 🎵 📹 🔗 | [GPS]            │ ← Flex-wrap, gap-1.5
│                                        │ ← Email ajouté !
├────────────────────────────────────────┤
│       [QR Code - 60px]                 │ ← Couleur tier
│       [Télécharger]                    │
├────────────────────────────────────────┤
│    📝 [Formulaire Avis Mini]          │
└────────────────────────────────────────┘
        ← 450px max, w-full →
```

---

## 🔒 Verrouillage Scroll Horizontal

### Container Principal
```tsx
className="max-w-[450px] w-full max-h-[85vh] mx-auto overflow-y-auto overflow-x-hidden"
```

**Propriétés critiques :**
- `w-full` : Largeur adaptative 100%
- `max-w-[450px]` : Jamais plus de 450px
- `overflow-x-hidden` : Bloque tout débordement horizontal

---

## 📝 Optimisations Texte

### Nom Entreprise
```tsx
className="text-base font-bold text-white truncate px-1"
```

### Catégorie
```tsx
className="font-medium text-xs truncate px-1"
style={{ color: colors.gold }}
```

### Ville & Téléphone
```tsx
<div className="flex items-center gap-1 truncate max-w-full px-1">
  <MapPin size={11} className="flex-shrink-0" style={{ color: colors.gold }} />
  <span className="truncate">{business.ville}</span>
</div>
```

### Description
```tsx
className="text-gray-300 text-[10px] leading-relaxed line-clamp-2 break-words"
```

---

## 🕐 Horaires d'Ouverture (Accordéon)

### Bouton Accordéon
```tsx
<button
  onClick={() => setShowFullSchedule(!showFullSchedule)}
  className="w-full flex items-center justify-between p-1.5 rounded-lg transition-all bg-white/5 hover:bg-white/10"
  style={{ border: `1px solid ${colors.gold}20` }}
>
  <Clock size={10} />
  <span className="text-white font-semibold text-[10px]">{text.openingHours}</span>
  <ChevronDown style={{ color: colors.gold }} />
</button>
```

### Ligne Horaire
```tsx
<div className="flex items-center justify-between text-[9px] rounded px-1 py-0.5">
  <span className="truncate flex-shrink-0 mr-1" style={{ maxWidth: '80px' }}>
    Lundi
  </span>
  <span className="truncate text-right">09:00-18:00</span>
</div>
```

---

## 🔗 Réseaux Sociaux + GPS

### Icône Email (NOUVEAU !)
```tsx
{business.email && (
  <a
    href={`mailto:${business.email}`}
    className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 bg-[#6B7280]"
    title={business.email}
  >
    <Mail size={10} className="text-white" />
  </a>
)}
```

### Bouton GPS
```tsx
<a
  href={getGoogleMapsDirectionsUrl(business.latitude, business.longitude, business.adresse)}
  className="inline-flex items-center gap-0.5 text-white px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wide shadow-lg hover:scale-105 transition-transform flex-shrink-0"
  style={{ backgroundColor: colors.gold }}
>
  <Navigation size={9} strokeWidth={3} />
  <span className="truncate max-w-[100px]">{text.directions}</span>
</a>
```

### Container Flex-Wrap
```tsx
<div className="flex items-center justify-center gap-1.5 pt-0.5 flex-wrap px-1"
     style={{ borderTop: `1px solid ${colors.gold}30` }}>
  {/* Icônes réseaux sociaux */}
</div>
```

**Comportement :**
- Si trop d'icônes, passage automatique à la ligne (`flex-wrap`)
- Gap réduit à `gap-1.5` au lieu de `gap-2`
- Toutes les icônes : `flex-shrink-0` (ne rétrécissent jamais)

---

## 📱 QR Code

### Génération
```tsx
<QRCodeSVG
  value={window.location.href}
  size={60}
  level="H"
  includeMargin={true}
  fgColor={colors.gold}    // Couleur dynamique tier
  bgColor="#FFFFFF"
/>
```

### Bouton Télécharger
```tsx
<button
  onClick={downloadQRCode}
  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full transition-all text-[8px] font-medium"
  style={{
    backgroundColor: `${colors.gold}20`,
    color: colors.gold
  }}
>
  <Download size={8} />
  {text.downloadQR}
</button>
```

---

## 🖼️ Galerie Photos

### Container
```tsx
<div className="w-full max-w-full overflow-hidden">
  <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-100 w-full" style={{ height: '120px' }}>
    <ImageWithFallback
      src={thumbnailUrls[currentIndex]}
      className="w-full h-full object-cover"
    />
  </div>
</div>
```

**Garanties :**
- `w-full` : Toujours 100% du container
- `max-w-full` : Jamais plus large que le parent
- `overflow-hidden` : Coupe tout débordement

---

## ✅ Checklist Finale

### Container Principal
- [x] `max-w-[450px]` : Largeur maximale
- [x] `w-full` : Largeur adaptative
- [x] `overflow-x-hidden` : Zéro scroll horizontal
- [x] `overflow-y-auto` : Scroll vertical uniquement
- [x] Couleur background dynamique selon tier
- [x] Bordure couleur dynamique selon tier

### Textes
- [x] Nom : `truncate` + `text-base`
- [x] Catégorie : `truncate` + couleur tier
- [x] Ville : `truncate` + icône couleur tier
- [x] Téléphone : `truncate` + couleur tier
- [x] Description : `line-clamp-2` + `break-words`

### Horaires
- [x] Accordéon fermé par défaut
- [x] Taille police : `text-[9px]`
- [x] Jours : `truncate` + `max-w-[80px]`
- [x] Heures : `truncate text-right`
- [x] Bordure couleur tier

### Réseaux Sociaux
- [x] **Email ajouté** avec icône Mail
- [x] Flex-wrap activé
- [x] Gap réduit : `gap-1.5`
- [x] Toutes icônes : `flex-shrink-0`
- [x] GPS : taille réduite + couleur tier

### Galerie
- [x] Bannière : `w-full` + `height: 120px`
- [x] Container : `overflow-hidden`
- [x] Logo : bordure couleur tier

### QR Code
- [x] Couleur QR = couleur tier
- [x] Bouton télécharger couleur tier
- [x] Taille : 60px

### Paddings
- [x] Container principal : `px-2 pb-2`
- [x] Horaires : `px-1 py-0.5`
- [x] Toutes sections : paddings mini

---

## 🎯 Résultat Final

```
✅ Largeur : 450px max (adaptative)
✅ Scroll horizontal : ZÉRO
✅ Scroll vertical : Minimal (max-h-[85vh])
✅ Couleurs : Dynamiques selon tier (Elite/Premium/Artisan)
✅ Email : Icône ajoutée dans réseaux sociaux
✅ Textes : Tous tronqués/limités
✅ Horaires : Compacts (9px)
✅ GPS : Compact + couleur tier
✅ QR Code : Couleur tier
✅ Galerie : 100% largeur, 120px hauteur
✅ Responsive : Parfait sur tous écrans
```

---

## 📦 Fichiers Modifiés

### src/components/BusinessDetail.tsx
- Ajout système couleurs dynamiques `getTierColors()`
- Application `colors.gold` sur tous éléments
- Ajout icône email dans réseaux sociaux
- Optimisation paddings (px-2, text-[9px])
- QR Code couleur dynamique

### src/components/ImageGallery.tsx
- Container : `w-full max-w-full overflow-hidden`
- Bannière : `w-full` garantie

---

## 🚀 Performance

```
Build Time    : ~18s
BusinessDetail: 36.72 kB (12.71 kB gzip)
Total Bundle  : 1.5 MB (453 kB gzip)
```

---

## 🎨 Exemples Visuels

### Elite (Noir + Or)
```
┌─────────────────────────┐ ← Border: #D4AF37
│  [Photo]                │
│  🔴 (Border or)         │
│  ENTREPRISE             │
│  Catégorie (or)         │ ← Couleur: #D4AF37
│  📍 Ville | ☎️ Tél (or) │
│  [GPS or]               │ ← Background: #D4AF37
└─────────────────────────┘
  Background: #000000
```

### Premium (Vert + Or)
```
┌─────────────────────────┐ ← Border: #D4AF37
│  [Photo]                │
│  🔴 (Border or)         │
│  ENTREPRISE             │
│  Catégorie (or)         │ ← Couleur: #D4AF37
│  📍 Ville | ☎️ Tél (or) │
│  [GPS or]               │ ← Background: #D4AF37
└─────────────────────────┘
  Background: #064E3B
```

### Artisan (Bordeaux + Rouge)
```
┌─────────────────────────┐ ← Border: #DC2626
│  [Photo]                │
│  🔴 (Border rouge)      │
│  ENTREPRISE             │
│  Catégorie (rouge)      │ ← Couleur: #DC2626
│  📍 Ville | ☎️ Tél (rouge)│
│  [GPS rouge]            │ ← Background: #DC2626
└─────────────────────────┘
  Background: #7F1D1D
```

---

## 📝 Notes Importantes

1. **Priorité 1** : Zéro scroll horizontal (100% réussi)
2. **Priorité 2** : Couleurs dynamiques tier (100% réussi)
3. **Priorité 3** : Email ajouté (100% réussi)
4. **Priorité 4** : Tout doit rentrer dans 450px (100% réussi)

**Aucun compromis sur la largeur !**

---

## 🔧 Maintenance Future

Si ajout de nouvelles icônes sociales :
1. Taille : `w-6 h-6`
2. Icône : `size={10}`
3. Ajouter dans la div `flex-shrink-0`
4. Le `flex-wrap` gérera automatiquement le passage à la ligne

Si modification des couleurs :
1. Modifier uniquement `getTierColors()`
2. Toutes les couleurs se mettent à jour automatiquement

---

**STATUS : ✅ PRODUCTION READY**
**VERSION : 2.0 - Mars 2026**
**FORMAT : 450px Verrouillé + Couleurs Dynamiques + Email**
