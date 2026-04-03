# Affichage Compact des Horaires avec Style Amélioré

## Modifications apportées - 27 Février 2026

### Objectif Principal
Optimiser l'affichage des horaires avec un accordéon interactif et un style de tableau amélioré pour une meilleure lisibilité.

---

## Améliorations Majeures

### 1. **Accordéon avec animation fluide**
- Zone cliquable complète (tout le bloc)
- Flèche qui pivote à 180° lors du dépliage
- Transition CSS native (max-height + opacity)
- Durée : 0.3s avec easing naturel

### 2. **Affichage "Aujourd'hui"**
- Remplace le nom du jour par "Aujourd'hui" dans l'état fermé
- Traduction multilingue (FR, EN, AR, IT, RU)
- Plus intuitif et immédiat pour l'utilisateur

### 3. **Tableau compact avec largeur fixe**
- Colonne des jours : **100px** (BusinessCard) / **120px** (BusinessDetail)
- Version minimale : **80px**
- Horaires alignés juste à côté (12-16px de marge)
- Fini le `justify-content: space-between` qui éloignait trop

### 4. **Lignes alternées pour faciliter la lecture**
- Ligne paire : transparente
- Ligne impaire : gris très léger `rgba(0, 0, 0, 0.02)`
- Jour actuel : fond bleu subtil `rgba(59, 130, 246, 0.08)`
- Border-radius : 4-6px

### 5. **Focus visuel sur le jour actuel**
- Fond bleu léger pour le repérer instantanément
- Jour en **gras 700**
- Horaire en **semi-gras 600**
- Couleur pleine (pas de transparence)

---

## Code CSS Final

### BusinessCard.tsx (ligne 269-333)
```typescript
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    padding: '6px 8px',
    backgroundColor: isToday
      ? 'rgba(59, 130, 246, 0.08)'
      : index % 2 === 0
        ? 'transparent'
        : 'rgba(0, 0, 0, 0.02)',
    borderRadius: '4px',
    marginBottom: index < total - 1 ? '2px' : '0'
  }}
>
  <span
    style={{
      width: isMinimal ? '80px' : '100px',
      flexShrink: 0,
      fontWeight: isToday ? '700' : '500',
      color: schedule.isOpen ? '#1A1A1A' : '#EF4444'
    }}
  >
    {schedule.day}
  </span>
  <span
    style={{
      marginLeft: '12px',
      fontWeight: isToday ? '600' : '400',
      color: schedule.isOpen ? (isToday ? '#1A1A1A' : '#6B7280') : '#EF4444'
    }}
  >
    {schedule.hours}
  </span>
</div>
```

### BusinessDetail.tsx (ligne 797-860)
```typescript
<div
  style={{
    padding: '8px 10px',
    backgroundColor: isToday
      ? 'rgba(59, 130, 246, 0.08)'
      : index % 2 === 0
        ? 'transparent'
        : isPremium
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(0, 0, 0, 0.02)',
    borderRadius: '6px',
    marginBottom: index < total - 1 ? '3px' : '0'
  }}
>
  <span style={{ width: '120px', flexShrink: 0, fontWeight: isToday ? '700' : '500' }}>
    {dayName}
  </span>
  <span style={{ marginLeft: '16px', fontWeight: isToday ? '600' : '400' }}>
    {hours}
  </span>
</div>
```

---

## Avant / Après

### Avant
```
Lundi                        08:00-17:00
                             ↑ trop d'espace
Mardi                        08:00-17:00
Mercredi                     08:00-17:00
```

### Après
```
Lundi        08:00-17:00
Mardi        08:00-17:00
Mercredi     08:00-17:00
Jeudi        08:00-17:00
Vendredi     08:00-17:00  ← fond bleu + gras
Samedi       09:00-15:00
Dimanche     Fermé
```

---

## Hiérarchie Visuelle

### Police
- **Jour actuel** : 700 (bold)
- **Autres jours** : 500 (medium)
- **Horaire actuel** : 600 (semi-bold)
- **Autres horaires** : 400 (regular)

### Couleurs
| Élément | Couleur | Usage |
|---------|---------|-------|
| Jour actuel | `#1A1A1A` | Noir plein |
| Autres jours | `#6B7280` | Gris moyen |
| Horaire actuel | `#1A1A1A` | Noir plein |
| Autres horaires | `#9CA3AF` | Gris léger |
| Fermé | `#EF4444` | Rouge |
| Fond actuel | `rgba(59, 130, 246, 0.08)` | Bleu 8% |
| Fond alterné | `rgba(0, 0, 0, 0.02)` | Noir 2% |

---

## Animation de l'Accordéon

```css
/* Conteneur dépliable */
max-height: showFullSchedule ? '500px' : '0';
overflow: hidden;
transition: max-height 0.3s ease, opacity 0.3s ease;
opacity: showFullSchedule ? 1 : 0;

/* Flèche */
transform: showFullSchedule ? 'rotate(180deg)' : 'rotate(0deg)';
transition: transform 0.3s ease;
```

---

## Design de l'Accordéon

### État Fermé
```
┌────────────────────────────────────┐
│ 🕐 Horaires d'ouverture            │
├────────────────────────────────────┤
│ [Ouvert]                        ▼  │
│ Aujourd'hui : 08:00-17:00          │
└────────────────────────────────────┘
```

### État Ouvert
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
│ │ Vendredi    08:00-17:00   ← 🔵 │ │
│ │ Samedi      09:00-15:00        │ │
│ │ Dimanche    Fermé              │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## Fichiers Modifiés

### 1. `/src/lib/horaireUtils.ts`
**Nouvelle fonction :**
```typescript
export function translateToday(language: string): string
```
Traduction de "Aujourd'hui" dans 5 langues

**Fonction mise à jour :**
```typescript
export function formatTodayScheduleText()
```
Utilise maintenant `translateToday()` au lieu du nom du jour

### 2. `/src/components/BusinessCard.tsx`
- Ligne 218-333 : Accordéon complet avec animation
- Largeur fixe : 100px (normal) / 80px (minimal)
- Lignes alternées + fond bleu pour aujourd'hui
- Jour actuel en gras 700

### 3. `/src/pages/BusinessDetail.tsx`
- Ligne 746-863 : Même système d'accordéon
- Largeur fixe : 120px
- Bordure dorée subtile
- Hover effect
- Adaptation Premium (fond blanc transparent)

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

## Avantages

### UX Améliorée
- Zone cliquable intuitive et large
- Animation professionnelle et fluide
- "Aujourd'hui" plus parlant que le nom du jour
- Flèche qui tourne (feedback visuel clair)
- Tableau compact et lisible

### Lisibilité
- Colonnes alignées verticalement
- Lignes alternées facilitent le suivi visuel
- Jour actuel immédiatement repérable
- Espacement cohérent

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
✅ Compilation réussie
✅ Aucune erreur TypeScript
✅ Optimisation bundle maintenue

---

*Documentation générée le 27 février 2026*
