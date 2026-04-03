# Référence Rapide - Confinement Voile Doré

**Pour :** Développeurs et mainteneurs du projet  
**Date :** Mars 2026

---

## Règles d'Or

### 1. Animations de Translation
```css
/* ❌ INTERDIT */
transform: translateX(200%);  /* Déborde ! */

/* ✅ AUTORISÉ */
transform: translateX(150%);  /* Confiné */
```

**Limite maximale :** ±150%

---

### 2. Conteneur d'Effet Animé
```tsx
<div style={{
  position: 'relative',
  overflow: 'hidden',      // ✅ Obligatoire
  isolation: 'isolate'     // ✅ Recommandé
}}>
  <div style={{
    maxWidth: '100%',       // ✅ Obligatoire
    contain: 'paint'        // ✅ Obligatoire
  }}>
    {/* Effet animé */}
  </div>
</div>
```

---

### 3. Nouveau Composant Carte

**Pas besoin de CSS spécifique !**

```tsx
// Automatiquement protégé si le nom contient :
// - "Card"
// - "SignatureCard"
// - "EventCard"
// - "business-card"
// - "modal-shine"

export const MyNewCard = () => (
  <SignatureCard tier="elite">
    {/* Protection automatique */}
  </SignatureCard>
);
```

---

## Sélecteurs Automatiques

Ces sélecteurs dans `index.css` protègent automatiquement :

```css
[class*="SignatureCard"],
[class*="Card"],
[class*="modal-shine"],
[class*="animate-"],
[class*="relative"],
.grid,
.flex,
main,
section
```

**Tu n'as rien à faire !** La protection s'applique automatiquement.

---

## Checklist Nouvelle Animation

Avant d'ajouter une animation qui translate horizontalement :

- [ ] Translation max ±150% (pas 200%)
- [ ] `max-width: 100%` sur l'élément animé
- [ ] `contain: paint` sur l'élément animé
- [ ] `overflow: hidden` sur le conteneur parent
- [ ] Tester sur mobile/tablet/desktop

---

## Debug Scroll Horizontal

### Console
```javascript
// Vérifier présence scroll horizontal
const hasHScroll = document.documentElement.scrollWidth > window.innerWidth;
console.log('Scroll horizontal:', hasHScroll ? '❌ OUI' : '✅ NON');
```

### Solution Rapide
Si tu vois un scroll horizontal :

1. Inspecter l'élément qui déborde
2. Ajouter `overflow: hidden` au parent
3. Ajouter `contain: paint` à l'élément animé
4. Vérifier que l'animation ne dépasse pas ±150%

---

## Propriétés CSS Essentielles

| Propriété | Quand l'utiliser |
|-----------|------------------|
| `overflow: hidden` | Sur le conteneur parent |
| `overflow-x: hidden` | Sur body/html pour bloquer page |
| `max-width: 100%` | Sur les enfants animés |
| `contain: paint` | Sur les effets visuels |
| `isolation: isolate` | Sur les conteneurs avec z-index |

---

## Contacts

Problème de débordement ? Vérifie :
1. `index.css` (lignes 38-105) - Protection globale
2. `SignatureCard.tsx` (lignes 92-153) - Effet shine confiné
3. Documentation complète : `CORRECTION_GLOBALE_VOILE_DORE_TOUTES_PAGES_2026.md`

---

**Règle Simple :** Si ça anime horizontalement, ça doit être confiné avec `contain: paint` + `max-width: 100%` ✅
