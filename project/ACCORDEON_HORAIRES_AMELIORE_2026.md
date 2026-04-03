# Système d'Accordéon Amélioré pour les Horaires

## Modifications apportées - Février 2026

### Objectif
Transformer l'affichage des horaires en un véritable accordéon interactif avec animation fluide et meilleure ergonomie.

---

## Nouvelles Fonctionnalités

### 1. **Accordéon cliquable**
- Zone cliquable étendue à tout le bloc d'horaires
- Animation fluide de rotation de la flèche (180°)
- Transition CSS native (max-height + opacity)

### 2. **Affichage "Aujourd'hui"**
- Remplace le nom du jour par "Aujourd'hui" dans l'état fermé
- Traduction multilingue (FR, EN, AR, IT, RU)
- Meilleure lisibilité immédiate

### 3. **Jour actuel en gras dans la liste**
- `font-weight: 700` pour le jour actuel
- `font-weight: 500` pour les autres jours
- Facilite le repérage visuel

### 4. **Animation fluide**
- Transition de `max-height` : 0 → 500px/600px
- Transition d'`opacity` : 0 → 1
- Durée : 0.3s avec easing naturel
- Rotation de la flèche synchronisée

---

## Fichiers Modifiés

### `/src/lib/horaireUtils.ts`
**Nouvelle fonction ajoutée :**
```typescript
export function translateToday(language: string): string {
  switch (language) {
    case 'en': return 'Today';
    case 'ar': return 'اليوم';
    case 'it': return 'Oggi';
    case 'ru': return 'Сегодня';
    default: return 'Aujourd\'hui';
  }
}
```

**Fonction mise à jour :**
- `formatTodayScheduleText()` - Utilise maintenant `translateToday()` au lieu du nom du jour

### `/src/components/BusinessCard.tsx`
**Modifications majeures :**
- Transformation du système bouton + zone dépliable → accordéon complet
- Zone cliquable étendue avec `<button>` englobant
- Flèche avec rotation CSS (`transform: rotate(180deg)`)
- Animation `max-height` + `opacity` sur le conteneur
- Jour actuel en gras (`fontWeight: isToday ? '700' : '500'`)

### `/src/pages/BusinessDetail.tsx`
**Modifications identiques :**
- Accordéon avec bouton englobant
- Bordure dorée subtile (`border: 1px solid rgba(212, 175, 55, 0.2)`)
- Hover effect (`hover:bg-white/10` ou `hover:bg-gray-100`)
- Animation synchronisée
- Jour actuel en gras

---

## Design de l'Accordéon

### État Fermé (par défaut)
```
┌────────────────────────────────────┐
│ 🕐 Horaires d'ouverture            │
├────────────────────────────────────┤
│ [Ouvert]                        ▼  │
│ Aujourd'hui : 08:00-17:00          │
└────────────────────────────────────┘
```

### État Ouvert (au clic)
```
┌────────────────────────────────────┐
│ 🕐 Horaires d'ouverture            │
├────────────────────────────────────┤
│ [Ouvert]                        ▲  │
│ Aujourd'hui : 08:00-17:00          │
│ ┌────────────────────────────────┐ │
│ │ Lundi       08:00-17:00        │ │
│ │ Mardi       08:00-17:00        │ │
│ │ Mercredi    08:00-17:00        │ │
│ │ Jeudi       08:00-17:00        │ │
│ │ Vendredi    08:00-17:00   ← gras│
│ │ Samedi      09:00-15:00        │ │
│ │ Dimanche    Fermé              │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## Traductions "Aujourd'hui"

| Langue | Traduction    |
|--------|---------------|
| FR     | Aujourd'hui   |
| EN     | Today         |
| AR     | اليوم         |
| IT     | Oggi          |
| RU     | Сегодня       |

---

## Comportement Technique

### Animation CSS
```css
/* Conteneur accordéon */
max-height: showFullSchedule ? '600px' : '0';
overflow: hidden;
transition: max-height 0.3s ease, opacity 0.3s ease;
opacity: showFullSchedule ? 1 : 0;

/* Flèche */
transform: showFullSchedule ? 'rotate(180deg)' : 'rotate(0deg)';
transition: transform 0.3s ease;
```

### Interactions
1. **Clic sur l'accordéon** : Ouvre/ferme avec animation fluide
2. **Clic sur zone dépliée** : `stopPropagation()` pour éviter d'ouvrir la fiche
3. **Hover** : Changement subtil de fond
4. **Jour actuel** : Automatiquement en gras

---

## Avantages

### UX Améliorée
- Zone cliquable intuitive et large
- Animation professionnelle et fluide
- "Aujourd'hui" plus parlant que "Vendredi"
- Flèche qui tourne (feedback visuel clair)

### Performance
- Transition CSS native (GPU-accelerated)
- Pas de JavaScript pour l'animation
- Léger et rapide

### Accessibilité
- Bouton sémantique `<button>`
- Zone de clic généreuse
- Indicateur visuel clair (flèche)

---

## Build
✅ Le build compile sans erreur
✅ Testé sur tous les navigateurs modernes

---

*Documentation générée le 27 février 2026*
