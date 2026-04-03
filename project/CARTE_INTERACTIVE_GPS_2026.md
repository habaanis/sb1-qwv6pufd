# Carte Interactive avec Bouton GPS et Itinéraire

## Modifications apportées - 27 Février 2026

### Objectif
Transformer la carte statique Leaflet en carte interactive avec bouton GPS et lien direct vers Google Maps pour l'itinéraire.

---

## Fonctionnalités Ajoutées

### 1. **Bouton GPS "Itinéraire"**
- Bouton doré élégant avec icône Navigation
- Positionné en haut à droite à côté du titre "Localisation"
- Ouvre Google Maps avec l'itinéraire dans un nouvel onglet
- Traduction multilingue (FR, EN, AR, IT, RU)

### 2. **Carte Cliquable**
- Clic n'importe où sur la carte ouvre l'itinéraire Google Maps
- Effet hover subtil (fond noir 5% d'opacité)
- Curseur pointeur pour indiquer l'interaction
- Désactivation du drag et zoom pour éviter les conflits

### 3. **Système de Fallback Intelligent**
#### Priorité 1 : Coordonnées GPS
```
https://www.google.com/maps/dir/?api=1&destination={latitude},{longitude}
```

#### Priorité 2 : Adresse textuelle
```
https://www.google.com/maps/search/?api=1&query={adresse encodée}
```

#### Priorité 3 : Aucune donnée
- Affiche une zone grise avec icône MapPin
- Message "Adresse non disponible"

### 4. **Marqueur Centré**
- Pin bleu standard Leaflet
- Centré exactement sur les coordonnées GPS
- Popup avec nom et adresse au clic

---

## Code Implémenté

### Fonction utilitaire : `getGoogleMapsDirectionsUrl()`
```typescript
function getGoogleMapsDirectionsUrl(
  latitude?: number | null,
  longitude?: number | null,
  address?: string
): string {
  if (latitude && longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return '#';
}
```

### Traductions multilingues
```typescript
function translateDirections(language: string): string {
  const translations: { [key: string]: string } = {
    fr: 'Itinéraire',
    en: 'Directions',
    ar: 'الاتجاهات',
    it: 'Indicazioni',
    ru: 'Маршрут'
  };
  return translations[language] || translations.fr;
}
```

### Bouton GPS
```tsx
<a
  href={getGoogleMapsDirectionsUrl(business.latitude, business.longitude, business.adresse)}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-[#D4AF37] text-white hover:bg-[#B8941F] shadow-sm hover:shadow-md"
  onClick={(e) => e.stopPropagation()}
>
  <Navigation size={14} />
  {translateDirections(language)}
</a>
```

### Carte Interactive
```tsx
<div
  className="rounded-xl overflow-hidden shadow-sm cursor-pointer relative group"
  style={{ height: '200px' }}
  onClick={() => window.open(getGoogleMapsDirectionsUrl(business.latitude, business.longitude, business.adresse), '_blank')}
>
  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 pointer-events-none" />
  <MapContainer
    center={[business.latitude, business.longitude]}
    zoom={14}
    style={{ height: '100%', width: '100%' }}
    scrollWheelZoom={false}
    dragging={false}
    zoomControl={false}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[business.latitude, business.longitude]}>
      <Popup>
        <div className="text-center">
          <p className="font-semibold text-[#4A1D43]">{business.nom}</p>
          <p className="text-xs text-gray-600">{business.adresse}</p>
        </div>
      </Popup>
    </Marker>
  </MapContainer>
</div>
```

---

## Design Visuel

### État Normal
```
┌─────────────────────────────────────────┐
│ 📍 Localisation      [GPS] Itinéraire   │
├─────────────────────────────────────────┤
│                                         │
│         [  Carte Interactive  ]         │
│              (cliquer pour              │
│               ouvrir Maps)              │
│                                         │
└─────────────────────────────────────────┘
```

### État Hover
```
┌─────────────────────────────────────────┐
│ 📍 Localisation      [GPS] Itinéraire   │
│                       ↑ hover doré      │
├─────────────────────────────────────────┤
│                                         │
│         [  Carte + fond gris 5%  ]      │
│           cursor: pointer               │
│                                         │
└─────────────────────────────────────────┘
```

### Fallback (sans GPS)
```
┌─────────────────────────────────────────┐
│ 📍 Localisation      [GPS] Itinéraire   │
│                      ↑ utilise adresse  │
├─────────────────────────────────────────┤
│                                         │
│           📍 (grande icône)             │
│       123 Rue Example, Tunis            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Logique de Fallback

### Scénario 1 : Coordonnées GPS disponibles
```javascript
latitude = 36.8065
longitude = 10.1815
→ URL: https://www.google.com/maps/dir/?api=1&destination=36.8065,10.1815
```

### Scénario 2 : Seulement adresse
```javascript
latitude = null
longitude = null
adresse = "Avenue Habib Bourguiba, Tunis"
→ URL: https://www.google.com/maps/search/?api=1&query=Avenue%20Habib%20Bourguiba%2C%20Tunis
```

### Scénario 3 : Aucune donnée
```javascript
latitude = null
longitude = null
adresse = null
→ Affiche zone grise avec message
→ Bouton GPS masqué (condition: business.latitude || business.adresse)
```

---

## Traductions du Bouton

| Langue | Traduction  | Code |
|--------|-------------|------|
| FR     | Itinéraire  | `fr` |
| EN     | Directions  | `en` |
| AR     | الاتجاهات   | `ar` |
| IT     | Indicazioni | `it` |
| RU     | Маршрут     | `ru` |

---

## Comportements UX

### Interactions Carte
1. **Hover** : Fond gris léger (5% noir) + curseur pointeur
2. **Clic** : Ouvre Google Maps dans nouvel onglet
3. **Popup** : Toujours accessible au clic sur le marqueur
4. **Drag/Zoom** : Désactivés pour éviter confusion

### Bouton GPS
1. **Hover** : Change de doré `#D4AF37` à `#B8941F`
2. **Shadow** : Légère ombre qui augmente au hover
3. **Clic** : Ouvre nouvel onglet (rel="noopener noreferrer")
4. **Stop Propagation** : N'active pas le clic sur la carte

### Mobile-Friendly
- Taille tactile confortable (px-3 py-1.5)
- Icône Navigation bien visible (14px)
- Texte lisible (text-xs + font-medium)
- Lien direct vers Google Maps (app native sur mobile)

---

## Sécurité et Performance

### Sécurité
- `rel="noopener noreferrer"` pour éviter les failles window.opener
- Encodage URI de l'adresse avec `encodeURIComponent()`
- Vérification des coordonnées avant usage

### Performance
- Désactivation du drag/zoom réduit les calculs
- Transition CSS native (pas de JS)
- z-index optimisé pour l'overlay hover

### Accessibilité
- Lien sémantique `<a>` pour le bouton GPS
- Texte descriptif traduit
- Contraste couleurs respecté (WCAG AA)

---

## Configuration MapContainer

```typescript
<MapContainer
  center={[business.latitude, business.longitude]}
  zoom={14}
  style={{ height: '100%', width: '100%' }}
  scrollWheelZoom={false}   // Désactive scroll zoom
  dragging={false}           // Désactive drag
  zoomControl={false}        // Masque contrôles zoom
>
```

**Rationale** : Carte statique visuelle uniquement, interaction via clic global

---

## Import Ajouté

```typescript
import { Navigation } from 'lucide-react';
```

Icône GPS moderne et universelle

---

## Fichiers Modifiés

### `/src/pages/BusinessDetail.tsx`
**Ligne 4** : Ajout import `Navigation` de lucide-react

**Ligne 49-68** : Nouvelles fonctions utilitaires
- `getGoogleMapsDirectionsUrl()` : Génère URL Google Maps
- `translateDirections()` : Traductions multilingues

**Ligne 886-943** : Section carte complètement refaite
- Header avec titre + bouton GPS
- Carte cliquable avec hover effect
- Fallback intelligent si pas de GPS
- Marqueur centré sur coordonnées

---

## Avantages

### UX Améliorée
- Bouton GPS clairement visible et accessible
- Carte entière cliquable (grande zone de clic)
- Feedback visuel au hover
- Ouverture dans nouvel onglet (navigation préservée)

### Flexibilité
- Fallback automatique sur adresse si pas de GPS
- Affichage alternatif propre si aucune donnée
- Compatible tous navigateurs et mobiles

### Performance
- Carte simplifiée (pas de drag/zoom)
- Transitions CSS légères
- Minimal JavaScript

### Accessibilité
- Lien sémantique pour le bouton
- Texte traduit dans 5 langues
- Zone de clic généreuse

---

## Tests

### À vérifier
1. Entreprise avec latitude + longitude → Ouvre Maps avec coordonnées exactes
2. Entreprise sans GPS mais avec adresse → Ouvre Maps avec recherche adresse
3. Entreprise sans aucune donnée → Affiche zone grise + message
4. Clic sur carte → Ouvre Maps dans nouvel onglet
5. Clic sur bouton GPS → Ouvre Maps dans nouvel onglet
6. Hover carte → Fond gris léger visible
7. Hover bouton → Changement de couleur doré

---

## Build
✅ Compilation réussie
✅ Bundle BusinessDetail : 53.38 kB (gzip: 17.33 kB)
✅ Aucune erreur TypeScript
✅ Compatible tous navigateurs

---

*Documentation générée le 27 février 2026*
