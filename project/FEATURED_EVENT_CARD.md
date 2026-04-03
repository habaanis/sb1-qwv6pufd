# Composant FeaturedEventCard - Documentation

## Vue d'ensemble

Le composant `FeaturedEventCard` est un cadre d'affichage élégant et raffiné conçu pour mettre en avant un événement vedette sur la page d'accueil de Dalil Tounes.

## Design & Style

### Palette de couleurs
- **Rouge tunisien**: `#D62828` - Accent principal
- **Doré premium**: `#C9A96E` - Pour les événements sponsorisés (option `highlight`)
- **Gris clair**: `#F5F5F5` - Arrière-plans
- **Blanc**: `#FFFFFF` - Texte et boutons
- **Noir translucide**: `rgba(0,0,0,0.4)` - Overlays

### Typographie
- **Playfair Display**: Titres élégants avec style serif raffiné
- **Lato Light**: Texte descriptif léger et moderne
- **Poppins**: Interface et boutons

## Utilisation

### Import
```tsx
import { FeaturedEventCard } from '../components/FeaturedEventCard';
```

### Exemple basique
```tsx
<FeaturedEventCard
  event={featuredEvent}
  onDiscoverClick={() => navigate('businessEvents')}
  highlight={false}
/>
```

### Exemple avec événement premium (highlight)
```tsx
<FeaturedEventCard
  event={premiumEvent}
  onDiscoverClick={() => navigate('businessEvents')}
  highlight={true}  // Ajoute un filet doré et badge premium
/>
```

### Props

| Prop | Type | Description | Requis |
|------|------|-------------|---------|
| `event` | `BusinessEvent \| null` | L'événement à afficher. Si `null`, affiche un état vide | ✅ Oui |
| `onDiscoverClick` | `() => void` | Fonction appelée lors du clic sur "Découvrir l'événement" | ✅ Oui |
| `highlight` | `boolean` | Active le mode premium avec filet doré (défaut: `false`) | ❌ Non |

### Interface BusinessEvent
```tsx
interface BusinessEvent {
  id: string;
  event_name: string;
  event_date: string;
  location: string;
  city: string;
  type: string;
  short_description: string;
  organizer: string;
  website?: string;
  image_url?: string;
  featured: boolean;
}
```

## Fonctionnalités

### 1. Image pleine largeur avec overlay sophistiqué
- Hauteur: 500px
- Effet zoom au survol: `scale(1.03)` sur 800ms
- Double overlay pour meilleure lisibilité:
  - Gradient noir du bas vers le haut
  - Couche noire translucide uniforme

### 2. Animations Framer Motion
- **Apparition**: Fade-in + slide-up (40px) sur 600ms
- **Hover**: Scale global léger (1.01)
- **Éléments séquentiels**: Badges, titre, détails avec délais progressifs
- **Boutons**: Translation vers le haut (-2px) au survol

### 3. Badge vedette dynamique
- **Mode standard**: Rouge tunisien avec bordure blanche semi-transparente
- **Mode highlight**: Doré (#C9A96E) avec texte "ÉVÉNEMENT PREMIUM"
- Animation: Slide depuis la gauche au chargement

### 4. Titre élégant
- Police Playfair Display (serif raffiné)
- Taille: 3xl (mobile) à 5xl (desktop)
- Ligne décorative au-dessus (rouge ou dorée selon mode)
- Ombre de texte pour contraste sur image

### 5. Détails de l'événement
- **Date**: Formatée selon la langue (12 mars 2025, March 12, 2025, etc.)
- **Lieu**: Ville et lieu complet
- Icônes dans des conteneurs semi-transparents avec backdrop-blur
- Couleur des icônes adaptée au mode (rouge ou doré)

### 6. Description
- 2 lignes maximum sur desktop
- Police légère (light) taille base à lg
- Espacement généreux (line-height: 1.7)
- Couleur: blanc à 90% d'opacité

### 7. Boutons CTA
- **Bouton principal**:
  - Fond blanc, texte rouge
  - Ombre importante qui s'amplifie au survol
  - Flèche qui se translate au hover
- **Bouton secondaire** (si URL fournie):
  - Bordure blanche semi-transparente
  - Backdrop blur
  - Devient opaque au survol

### 8. État vide (fallback)
- Design minimaliste et épuré
- Icône calendrier grise dans cercle
- Titre avec Playfair Display
- Message traduit dans les 5 langues
- Bouton CTA vers page événements

### 9. Mode highlight (premium)
- Filet doré fin autour du cadre (`ring-2 ring-[#C9A96E]`)
- Badge doré avec texte "ÉVÉNEMENT PREMIUM"
- Ligne décorative dorée
- Icônes avec fond doré semi-transparent

## Responsive

### Mobile (< 768px)
- Image pleine largeur
- Texte superposé en bas
- Padding réduit (p-8)
- Boutons empilés verticalement
- Typographie réduite (text-3xl)

### Desktop (≥ 768px)
- Image pleine largeur avec overlay
- Contenu aligné à gauche dans overlay
- Padding généreux (p-12)
- Boutons côte à côte
- Typographie large (text-5xl)

## Accessibilité

### Contraste
- Ratio texte blanc sur fond sombre: > 7:1
- Boutons avec états hover/focus visibles
- Ombres de texte pour lisibilité sur image

### Navigation clavier
- Tous les boutons accessibles au clavier
- États focus visibles
- Ordre de tabulation logique

### Traductions
Support complet pour:
- 🇫🇷 Français
- 🇬🇧 English
- 🇸🇦 العربية (Arabe)
- 🇮🇹 Italiano
- 🇷🇺 Русский

## Intégration base de données

### Récupération de l'événement vedette
```tsx
const fetchFeaturedEvent = async () => {
  const { data, error } = await supabase
    .from('business_events')
    .select('*')
    .eq('featured', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  setFeaturedEvent(data);
};
```

### Champ `featured` dans Supabase
```sql
ALTER TABLE business_events
ADD COLUMN featured boolean DEFAULT false;

CREATE INDEX idx_featured_events
ON business_events(featured)
WHERE featured = true;
```

## Performances

### Optimisations
- Images lazy-loaded
- Animations GPU-accelerated (transform, opacity)
- Composant mémorisé si nécessaire
- Transitions CSS performantes

### Taille
- Code TypeScript: ~250 lignes
- Impact bundle: ~15KB (non compressé)

## Exemple complet

```tsx
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { FeaturedEventCard } from './components/FeaturedEventCard';

function HomePage() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      const { data } = await supabase
        .from('business_events')
        .select('*')
        .eq('featured', true)
        .maybeSingle();

      setEvent(data);
    }

    loadEvent();
  }, []);

  return (
    <div>
      {/* Autres sections */}

      <FeaturedEventCard
        event={event}
        onDiscoverClick={() => navigate('/evenements')}
        highlight={event?.is_premium}
      />

      {/* Suite du contenu */}
    </div>
  );
}
```

## Notes techniques

### Dépendances
- `framer-motion`: Animations fluides
- `lucide-react`: Icônes (Calendar, MapPin, TrendingUp)
- `tailwindcss`: Styles utility-first

### Fonts requises
Ajouter dans `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
```

---

**Créé pour Dalil Tounes** - Un composant élégant et professionnel pour mettre en valeur vos événements d'entreprise.
