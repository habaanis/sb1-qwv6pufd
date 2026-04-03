# Système de Couleurs Elite - Harmonisation Globale 2026

## Vue d'ensemble

Le système de couleurs Elite unifie toute la plateforme avec une identité visuelle premium basée sur 4 paliers d'abonnement distincts, chacun avec sa propre personnalité visuelle.

## Palette de Couleurs Principales

### Or / Gold
```css
--signature-gold: #D4AF37;
--signature-gold-hover: #C4A027;
```
Utilisé pour:
- Bordures de toutes les cartes
- Icônes de contact (téléphone, adresse, email, site web)
- Boutons principaux sur fonds colorés
- Badges et accents premium

### Gris Clair (Découverte)
```css
--tier-decouverte: #F8FAFC;
```
- Fond du palier gratuit
- Élégant et sobre

### Mauve Premium (Artisan)
```css
--tier-artisan: #4A1D43;
--tier-artisan-light: #5A2D53;
```
- Nouveau standard pour le palier payant principal
- Remplace l'orange précédent
- Associé au professionnalisme et à l'élégance

### Vert Émeraude (Premium)
```css
--tier-premium: #064E3B;
--tier-premium-light: #065F46;
```
- Palier Premium
- Évoque la croissance et la prospérité

### Anthracite (Élite Pro)
```css
--tier-elite: #121212;
--tier-elite-light: #1E1E1E;
```
- Palier le plus haut
- Luxe absolu et exclusivité

## Paliers d'Abonnement

### 1. Découverte (Gratuit)

**Caractéristiques:**
- Fond: Gris très clair (#F8FAFC)
- Bordure: Dorée fine (1px)
- Texte titre: Gris foncé (#111827)
- Texte secondaire: Gris moyen (#4B5563)
- Bouton: Contour doré avec texte doré

**Usage:**
```tsx
<SignatureCard tier="decouverte">
  {/* Contenu */}
</SignatureCard>
```

### 2. Artisan (Mauve Premium)

**Caractéristiques:**
- Fond: Mauve profond (#4A1D43)
- Bordure: Dorée épaisse (2px) avec lueur
- Texte titre: Blanc
- Texte secondaire: Gris clair (#E5E7EB)
- Bouton: Fond doré (#D4AF37) avec texte mauve
- Effet: Glass shine au survol
- Badge: "Populaire" en or

**Usage:**
```tsx
<SignatureCard tier="artisan">
  {/* Contenu */}
</SignatureCard>
```

**Exemple de texte:**
```tsx
<h3 className="text-white font-bold">Titre</h3>
<p className="text-gray-200">Description</p>
<button className="bg-[#D4AF37] text-[#4A1D43] hover:bg-[#C4A027]">
  Action
</button>
```

### 3. Premium (Vert Émeraude)

**Caractéristiques:**
- Fond: Vert émeraude profond (#064E3B)
- Bordure: Dorée épaisse (2px) avec lueur
- Texte titre: Blanc
- Texte secondaire: Gris clair (#E5E7EB)
- Bouton: Fond doré (#D4AF37) avec texte vert
- Effet: Glass shine au survol

**Usage:**
```tsx
<SignatureCard tier="premium">
  {/* Contenu */}
</SignatureCard>
```

**Exemple de texte:**
```tsx
<h3 className="text-white font-bold">Titre</h3>
<p className="text-gray-200">Description</p>
<button className="bg-[#D4AF37] text-[#064E3B] hover:bg-[#C4A027]">
  Action
</button>
```

### 4. Élite Pro (Anthracite)

**Caractéristiques:**
- Fond: Anthracite (#121212)
- Bordure: Dorée épaisse (2px) avec lueur intense
- Texte titre: Or (#D4AF37)
- Texte secondaire: Gris clair (#D1D5DB)
- Bouton: Fond doré (#D4AF37) avec texte anthracite
- Effet: Glass shine au survol

**Usage:**
```tsx
<SignatureCard tier="elite">
  {/* Contenu */}
</SignatureCard>
```

**Exemple de texte:**
```tsx
<h3 className="text-[#D4AF37] font-bold">Titre</h3>
<p className="text-gray-300">Description</p>
<button className="bg-[#D4AF37] text-[#121212] hover:bg-[#C4A027]">
  Action
</button>
```

### 5. Custom (Sur-mesure)

**Caractéristiques:**
- Fond: Gris clair (#F9FAFB)
- Bordure: Pointillée grise (2px)
- Texte titre: Gris foncé
- Texte secondaire: Gris moyen
- Bouton: Fond gris foncé avec texte blanc

**Usage:**
```tsx
<SignatureCard tier="custom">
  {/* Contenu */}
</SignatureCard>
```

## Effets Visuels

### Bordure Dorée

Toutes les cartes ont une bordure dorée:
- **Standard (Découverte)**: 1px
- **Premium (Artisan, Premium, Elite)**: 2px avec effet de lueur

```css
/* Découverte */
border: 1px solid #D4AF37;

/* Premium tiers */
border: 2px solid #D4AF37;
box-shadow: 0 8px 32px rgba(212, 175, 55, 0.15),
            0 0 40px rgba(212, 175, 55, 0.08);
```

### Glass Shine Effect

Effet de reflet lumineux au survol pour les paliers premium:
- Animation de 1.5s
- Gradient lumineux diagonal
- Déclenché uniquement au survol

```tsx
{showShineEffect && (
  <div
    className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    style={{
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
      animation: 'shine 1.5s ease-in-out',
      transform: 'translateX(-100%)',
    }}
  />
)}
```

### Coins Arrondis

Tous les éléments utilisent un arrondi uniforme:
```css
border-radius: 20px;
```

## Icônes de Contact

Toutes les icônes de contact sont dorées (#D4AF37):

```tsx
<Phone className="text-[#D4AF37]" />
<MapPin className="text-[#D4AF37]" />
<Mail className="text-[#D4AF37]" />
<Globe className="text-[#D4AF37]" />
```

## Badges Premium

Badge standard pour les éléments premium:
```tsx
<div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
  <Star className="w-3 h-3 fill-white" />
  PREMIUM
</div>
```

## Boutons d'Action

### Palier Découverte
```tsx
<button className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-gray-900">
  Action
</button>
```

### Paliers Premium (Artisan, Premium, Elite)
```tsx
// Artisan
<button className="bg-[#D4AF37] text-[#4A1D43] hover:bg-[#C4A027]">
  Action
</button>

// Premium
<button className="bg-[#D4AF37] text-[#064E3B] hover:bg-[#C4A027]">
  Action
</button>

// Elite
<button className="bg-[#D4AF37] text-[#121212] hover:bg-[#C4A027]">
  Action
</button>
```

## Badges de Fonctionnalités

Sur les cartes d'abonnement, tous les badges de check sont dorés:

```tsx
<div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4AF37' }}>
  <Check className="w-2.5 h-2.5 text-white" />
</div>
```

## Guide d'Application

### Pour les Cartes de Résultats

```tsx
import SignatureCard from './SignatureCard';

// Déterminer le palier selon is_premium ou autre propriété
const tier = business.is_premium ? 'artisan' : 'decouverte';

<SignatureCard tier={tier} className="p-6">
  <h3 className={tier === 'artisan' ? 'text-white' : 'text-gray-900'}>
    {business.name}
  </h3>
  <div className="flex items-center gap-2">
    <Phone className="text-[#D4AF37]" />
    <span className={tier === 'artisan' ? 'text-gray-200' : 'text-gray-600'}>
      {business.phone}
    </span>
  </div>
</SignatureCard>
```

### Pour la Page Tarifs

La page Subscription utilise automatiquement les bons styles selon le tier:
- Les couleurs de fond, bordures et textes sont appliquées automatiquement
- Les boutons sont dorés pour tous les paliers premium
- Le badge "Populaire" est affiché sur le palier Artisan

## Avantages du Système

1. **Cohérence Visuelle**: Design unifié sur toute la plateforme
2. **Hiérarchie Claire**: Distinction immédiate entre les paliers
3. **Premium Visibility**: Les abonnements premium se démarquent visuellement
4. **Élégance**: Le doré apporte un aspect haut de gamme
5. **Flexibilité**: Facile d'ajouter de nouveaux paliers
6. **Maintenance**: Modifications centralisées dans `SignatureCard`

## Migration

### Avant (Orange)
```tsx
<div className="bg-orange-600 text-white">
  <button className="bg-orange-600 hover:bg-orange-700">
    Action
  </button>
</div>
```

### Après (Mauve Elite)
```tsx
<SignatureCard tier="artisan">
  <button className="bg-[#D4AF37] text-[#4A1D43] hover:bg-[#C4A027]">
    Action
  </button>
</SignatureCard>
```

## Palette Complète

```css
/* Or - Global */
--gold: #D4AF37;
--gold-hover: #C4A027;

/* Paliers */
--decouverte-bg: #F8FAFC;
--artisan-bg: #4A1D43;
--artisan-light: #5A2D53;
--premium-bg: #064E3B;
--premium-light: #065F46;
--elite-bg: #121212;
--elite-light: #1E1E1E;

/* Textes sur fonds colorés */
--text-on-dark: #FFFFFF;
--text-on-dark-secondary: #E5E7EB;
--text-on-dark-tertiary: #D1D5DB;

/* Textes sur fond clair */
--text-on-light: #111827;
--text-on-light-secondary: #4B5563;
--text-on-light-tertiary: #9CA3AF;
```

---

**Date de création**: 3 février 2026
**Dernière mise à jour**: 3 février 2026
**Version**: 1.0
