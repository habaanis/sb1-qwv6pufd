# Guide Rapide Hreflang - Dalil Tounes

## En 3 Étapes

### 1️⃣ Importer le Hook

```tsx
import { useHreflangPath } from '../hooks/useHreflangPath';
```

### 2️⃣ Utiliser le Hook

```tsx
export default function MaPage() {
  const currentPath = useHreflangPath();

  // ... reste du code
}
```

### 3️⃣ Passer à SEOHead

```tsx
<SEOHead
  title="Mon Titre"
  description="Ma description"
  currentPath={currentPath}
/>
```

**C'est tout !** Le système gère automatiquement la génération des balises hreflang pour les 5 langues.

## Langues Supportées

| Code | Langue | x-default |
|------|--------|-----------|
| `fr` | Français | ✅ Oui |
| `ar` | Arabe | ❌ |
| `it` | Italien | ❌ |
| `ru` | Russe | ❌ |
| `en` | Anglais | ❌ |

## Exemple Complet

```tsx
import { useHreflangPath } from '../hooks/useHreflangPath';
import { SEOHead } from '../components/SEOHead';

export default function Concept() {
  const currentPath = useHreflangPath();

  return (
    <div>
      <SEOHead
        title="Notre Concept"
        description="Découvrez notre vision"
        keywords="concept, tunisie, dalil"
        currentPath={currentPath}
      />

      <h1>Notre Concept</h1>
      {/* Contenu de la page */}
    </div>
  );
}
```

## Résultat dans le HTML

```html
<link rel="alternate" hreflang="fr" href="https://dalil-tounes.com?lang=fr#/concept">
<link rel="alternate" hreflang="ar" href="https://dalil-tounes.com?lang=ar#/concept">
<link rel="alternate" hreflang="it" href="https://dalil-tounes.com?lang=it#/concept">
<link rel="alternate" hreflang="ru" href="https://dalil-tounes.com?lang=ru#/concept">
<link rel="alternate" hreflang="en" href="https://dalil-tounes.com?lang=en#/concept">
<link rel="alternate" hreflang="x-default" href="https://dalil-tounes.com?lang=fr#/concept">
```

## Test Rapide

Ouvrir la console et exécuter :

```javascript
document.querySelectorAll('link[hreflang]').length
// Résultat attendu : 7 (5 langues + x-default + auto-référence)
```

## Pages Déjà Mises à Jour

- ✅ `src/pages/Concept.tsx`
- ✅ `src/components/BusinessDetail.tsx`

## Documentation Complète

Voir : `SYSTEME_HREFLANG_MULTILINGUE_2026.md`

---

**Build :** ✅ Réussi
**Date :** 15 Mars 2026
