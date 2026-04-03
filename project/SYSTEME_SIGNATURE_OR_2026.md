# Système "Signature Or" - Harmonisation des Cartes

## Vue d'ensemble

Le système "Signature Or" unifie le design de toutes les cartes de résultats de recherche sur la plateforme avec une identité visuelle premium et cohérente.

## Composant Principal : `SignatureCard`

### Localisation
`src/components/SignatureCard.tsx`

### Utilisation

#### Mode Simple (isPremium)
```tsx
import SignatureCard from './SignatureCard';

<SignatureCard
  isPremium={false}
  onClick={() => {}}
  className="p-6"
>
  {/* Contenu de la carte */}
</SignatureCard>
```

#### Mode Paliers (tier)
```tsx
import SignatureCard from './SignatureCard';

<SignatureCard
  tier="artisan"
  className="p-6"
>
  {/* Contenu de la carte */}
</SignatureCard>
```

**Paliers disponibles:**
- `decouverte`: Gris clair avec bordure dorée fine
- `artisan`: Mauve premium avec bordure dorée épaisse
- `premium`: Vert émeraude avec bordure dorée épaisse
- `elite`: Anthracite avec bordure dorée épaisse
- `custom`: Gris clair avec bordure pointillée

## Design Standard (Non-Premium)

### Caractéristiques
- **Fond**: Blanc pur (#FFFFFF)
- **Bordure**: Dorée fine (1px, #D4AF37)
- **Coins**: Arrondis à 16px
- **Ombre**: Légère (`shadow-sm`) avec effet au survol (`hover:shadow-md`)
- **Transition**: Légère translation verticale au survol (-4px)

### Hiérarchie Visuelle
- **Titres**: Texte sombre (text-gray-900) en gras
- **Icônes de contact**: Dorées (#D4AF37) pour rappel de la bordure
  - Téléphone: `<Phone className="text-[#D4AF37]" />`
  - Adresse: `<MapPin className="text-[#D4AF37]" />`
  - Email: `<Mail className="text-[#D4AF37]" />`
  - Site web: `<Globe className="text-[#D4AF37]" />`

- **Texte secondaire**: Gris moyen (text-gray-600)
- **Badges/Tags**: Orange clair (bg-orange-50, text-orange-700)

## Design Premium

### Caractéristiques
- **Fond**: Mauve Profond (#4A1D43)
- **Bordure**: Dorée épaisse (2px, #D4AF37)
- **Coins**: Arrondis à 16px (identique)
- **Ombre**: Effet de lueur dorée
  ```css
  shadow: 0 8px 32px rgba(212, 175, 55, 0.15),
          0 0 40px rgba(212, 175, 55, 0.08)
  ```
- **Effet de reflet**: Animation "glass shine" au survol
  - Gradient lumineux traversant la carte en diagonal
  - Durée: 1.5s
  - Inclinaison: -15deg

### Hiérarchie Visuelle Premium
- **Titres**: Blanc (text-white)
- **Icônes de contact**: Dorées (#D4AF37) - identique
- **Texte secondaire**: Gris clair (text-gray-200)
- **Badges/Tags**: Mauve foncé avec texte doré (bg-[#5A2D53], text-[#D4AF37])
- **Badge Premium**:
  - Position: Coin supérieur droit (-top-2, -right-2)
  - Style: Gradient jaune-or avec étoile
  - Z-index: 10 ou 20 selon le contexte

## Cartes Harmonisées

### 1. BusinessDirectory (`src/components/business/BusinessDirectory.tsx`)
- Liste des entreprises (citoyens et partenaires)
- Support complet Premium/Standard
- Icônes de contact dorées
- Boutons d'action adaptés au statut

### 2. EventCard (`src/components/EventCard.tsx`)
- Événements locaux et culturels
- Image en haut avec gradient overlay
- Badges "Kids" et type d'événement
- Bouton billetterie adapté au statut Premium

### 3. MedicalTransportCard (`src/components/MedicalTransportCard.tsx`)
- Prestataires de transport médical
- Distinction ambulances/taxis conservée
- Icônes dorées pour localisation
- Bouton d'appel premium or

### 4. SimpleJobCard (`src/components/SimpleJobCard.tsx`)
- Offres d'emploi
- Déjà au format Mauve & Or Premium
- Effet glass shine au survol

## Palette de Couleurs

### Couleurs Principales
```css
/* Or / Gold */
--signature-gold: #D4AF37;
--signature-gold-hover: #C4A027;

/* Mauve */
--signature-purple: #4A1D43;
--signature-purple-light: #5A2D53;

/* Neutre Standard */
--bg-standard: #FFFFFF;
--text-dark: #111827;     /* text-gray-900 */
--text-medium: #4B5563;   /* text-gray-600 */
--text-light: #9CA3AF;    /* text-gray-400 */

/* Neutre Premium */
--text-premium-primary: #FFFFFF;
--text-premium-secondary: #E5E7EB;  /* text-gray-200 */
--text-premium-tertiary: #D1D5DB;   /* text-gray-300 */
```

### Couleurs d'État
```css
/* Success */
--success: #10B981;      /* green-600 */
--success-light: #34D399; /* green-400 */

/* Warning */
--warning: #F59E0B;      /* amber-500 */

/* Info */
--info: #3B82F6;         /* blue-600 */
```

## Effet Glass Shine

### Implémentation
```tsx
<div
  className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
  style={{
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
    animation: 'shine 1.5s ease-in-out',
    transform: 'translateX(-100%)',
  }}
/>
<style>{`
  @keyframes shine {
    0% { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(200%) skewX(-15deg); }
  }
  .group:hover > div:first-child {
    animation: shine 1.5s ease-in-out;
  }
`}</style>
```

## Checklist d'Intégration

Pour ajouter le style "Signature Or" à une nouvelle carte :

- [ ] Importer `SignatureCard`
- [ ] Wrapper le contenu dans `<SignatureCard isPremium={isPremium}>`
- [ ] Ajouter le badge Premium si nécessaire
- [ ] Utiliser les icônes dorées pour téléphone/adresse/etc.
- [ ] Appliquer les classes conditionnelles selon `isPremium`:
  - [ ] Titres: `${isPremium ? 'text-white' : 'text-gray-900'}`
  - [ ] Texte: `${isPremium ? 'text-gray-200' : 'text-gray-600'}`
  - [ ] Badges: `${isPremium ? 'bg-[#5A2D53] text-[#D4AF37]' : 'bg-orange-50 text-orange-700'}`
  - [ ] Boutons: `${isPremium ? 'bg-[#D4AF37] text-[#4A1D43]' : 'border border-[#D4AF37] text-[#D4AF37]'}`

## Avantages du Système

1. **Cohérence**: Design unifié sur toute la plateforme
2. **Distinction Premium**: Clara et valorisante
3. **Réutilisabilité**: Composant unique pour tous les types de cartes
4. **Maintenance**: Modifications centralisées dans `SignatureCard`
5. **Performance**: Animations GPU-accelerated
6. **Accessibilité**: Contraste suffisant dans les deux modes

## Notes de Performance

- Les animations utilisent `transform` et `opacity` (GPU-accelerated)
- Le composant `SignatureCard` est léger (~2KB)
- Pas d'images, uniquement CSS
- Compatible tous navigateurs modernes

---

**Date de création**: 3 février 2026
**Dernière mise à jour**: 3 février 2026
**Version**: 1.0
