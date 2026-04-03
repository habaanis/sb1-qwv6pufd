# Système Hreflang Multilingue Dynamique - Mars 2026

## Vue d'ensemble

Intégration complète des balises SEO hreflang dynamiques dans l'application Dalil Tounes pour supporter 5 langues et améliorer le référencement international.

## Langues Supportées

| Langue | Code | Statut | x-default |
|--------|------|--------|-----------|
| Français | `fr` | Par défaut | ✅ Oui |
| Arabe | `ar` | Activé | ❌ Non |
| Italien | `it` | Activé | ❌ Non |
| Russe | `ru` | Activé | ❌ Non |
| Anglais | `en` | Activé | ❌ Non |

**Note :** Le français (`fr`) est utilisé comme `x-default` pour les utilisateurs dont la langue n'est pas dans la liste.

## Architecture Technique

### 1. Hook `useHreflangPath`

**Fichier :** `src/hooks/useHreflangPath.ts`

Ce hook détecte automatiquement le chemin actuel (hash) et le met à jour lors des changements de navigation.

```typescript
import { useHreflangPath } from '../hooks/useHreflangPath';

// Utilisation dans un composant
const currentPath = useHreflangPath();
```

**Fonctionnalités :**
- Détection automatique du hash actuel (`#/`, `#/concept`, `#/businesses`, etc.)
- Écoute des changements de navigation (`hashchange`)
- Retourne le chemin formaté pour les balises hreflang

**Fonctions utilitaires :**
```typescript
// Génère une URL complète avec paramètre de langue
generateLanguageUrl(path: string, lang: string): string

// Extrait le paramètre de langue depuis l'URL
getLanguageFromUrl(): string | null
```

### 2. Composant `SEOHead` Amélioré

**Fichier :** `src/components/SEOHead.tsx`

Le composant SEOHead a été amélioré pour générer dynamiquement les balises hreflang.

**Nouvelle prop :**
```typescript
interface SEOHeadProps {
  // ... props existantes
  currentPath?: string; // Chemin actuel pour hreflang
}
```

**Utilisation :**
```tsx
import { SEOHead } from '../components/SEOHead';
import { useHreflangPath } from '../hooks/useHreflangPath';

export default function MyPage() {
  const currentPath = useHreflangPath();

  return (
    <>
      <SEOHead
        title="Mon titre"
        description="Ma description"
        currentPath={currentPath}
      />
      {/* Contenu de la page */}
    </>
  );
}
```

**Fonctionnement interne :**

1. **Nettoyage** : Supprime toutes les anciennes balises hreflang
2. **Génération** : Crée les URLs pour chaque langue supportée
3. **Injection** : Ajoute les balises dans le `<head>`
4. **Auto-référence** : Ajoute une balise pour la langue courante

**Structure des URLs générées :**
```
https://dalil-tounes.com?lang=fr#/concept
https://dalil-tounes.com?lang=ar#/concept
https://dalil-tounes.com?lang=it#/concept
https://dalil-tounes.com?lang=ru#/concept
https://dalil-tounes.com?lang=en#/concept
https://dalil-tounes.com?lang=fr#/concept (x-default)
```

### 3. LanguageContext Amélioré

**Fichier :** `src/context/LanguageContext.tsx`

Le contexte de langue a été amélioré pour :

1. **Détection automatique depuis l'URL** au chargement initial
2. **Persistance** dans localStorage
3. **Synchronisation** avec l'URL lors des changements

**Comportement :**
```
1. Page charge → Vérifie ?lang=xx dans l'URL
2. Si langue valide → Utilise cette langue
3. Sinon → Vérifie localStorage
4. Sinon → Utilise 'fr' par défaut
5. Change langue → Met à jour URL + localStorage
```

**Code :**
```typescript
const { language, setLanguage } = useLanguage();

// Change la langue (met à jour URL automatiquement)
setLanguage('ar');
```

## Balises HTML Générées

Pour chaque page, le système génère automatiquement les balises suivantes dans le `<head>` :

```html
<!-- Balise canonique -->
<link rel="canonical" href="https://dalil-tounes.com?lang=fr#/concept">

<!-- Balises hreflang pour toutes les langues -->
<link rel="alternate" hreflang="fr" href="https://dalil-tounes.com?lang=fr#/concept">
<link rel="alternate" hreflang="ar" href="https://dalil-tounes.com?lang=ar#/concept">
<link rel="alternate" hreflang="it" href="https://dalil-tounes.com?lang=it#/concept">
<link rel="alternate" hreflang="ru" href="https://dalil-tounes.com?lang=ru#/concept">
<link rel="alternate" hreflang="en" href="https://dalil-tounes.com?lang=en#/concept">

<!-- Balise x-default (version par défaut) -->
<link rel="alternate" hreflang="x-default" href="https://dalil-tounes.com?lang=fr#/concept">

<!-- Balise auto-référencée (langue courante) -->
<link rel="alternate" hreflang="fr" href="https://dalil-tounes.com?lang=fr#/concept">
```

## Pages Mises à Jour

Les pages suivantes utilisent maintenant le système hreflang :

### 1. Page Concept
**Fichier :** `src/pages/Concept.tsx`

```tsx
import { useHreflangPath } from '../hooks/useHreflangPath';

export default function Concept() {
  const currentPath = useHreflangPath();

  return (
    <>
      <SEOHead
        title="Notre Concept"
        description="..."
        currentPath={currentPath}
      />
      {/* ... */}
    </>
  );
}
```

### 2. Page BusinessDetail
**Fichier :** `src/components/BusinessDetail.tsx`

```tsx
import { useHreflangPath } from '../hooks/useHreflangPath';

export const BusinessDetail = ({ ... }) => {
  const currentPath = useHreflangPath();

  return (
    <>
      <SEOHead
        title={`${business.nom} - ${category}`}
        description="..."
        currentPath={currentPath}
      />
      {/* ... */}
    </>
  );
}
```

## Avantages SEO

### 1. Référencement International
- Google comprend quelle version afficher selon la langue de l'utilisateur
- Évite le contenu dupliqué entre les versions linguistiques
- Améliore le classement dans les résultats de recherche locaux

### 2. Expérience Utilisateur
- Les utilisateurs sont dirigés vers la bonne version linguistique
- Navigation cohérente entre les langues
- Mémorisation de la préférence linguistique

### 3. Standards Web
- Conforme aux recommandations Google pour hreflang
- Structure d'URLs cohérente et prévisible
- Auto-référence pour éviter les ambiguïtés

## Exemples d'URLs

### Page d'accueil
```
FR: https://dalil-tounes.com?lang=fr#/
AR: https://dalil-tounes.com?lang=ar#/
IT: https://dalil-tounes.com?lang=it#/
RU: https://dalil-tounes.com?lang=ru#/
EN: https://dalil-tounes.com?lang=en#/
```

### Page Entreprises
```
FR: https://dalil-tounes.com?lang=fr#/businesses
AR: https://dalil-tounes.com?lang=ar#/businesses
IT: https://dalil-tounes.com?lang=it#/businesses
RU: https://dalil-tounes.com?lang=ru#/businesses
EN: https://dalil-tounes.com?lang=en#/businesses
```

### Fiche Entreprise
```
FR: https://dalil-tounes.com?lang=fr#/business/restaurant-le-tunisia-123abc
AR: https://dalil-tounes.com?lang=ar#/business/restaurant-le-tunisia-123abc
IT: https://dalil-tounes.com?lang=it#/business/restaurant-le-tunisia-123abc
RU: https://dalil-tounes.com?lang=ru#/business/restaurant-le-tunisia-123abc
EN: https://dalil-tounes.com?lang=en#/business/restaurant-le-tunisia-123abc
```

## Comment Ajouter hreflang à une Nouvelle Page

### Étape 1 : Importer le hook
```tsx
import { useHreflangPath } from '../hooks/useHreflangPath';
```

### Étape 2 : Utiliser le hook
```tsx
export default function MaPage() {
  const currentPath = useHreflangPath();
  // ...
}
```

### Étape 3 : Passer currentPath à SEOHead
```tsx
<SEOHead
  title="Mon titre"
  description="Ma description"
  currentPath={currentPath}
/>
```

C'est tout ! Le système gère automatiquement la génération des balises hreflang.

## Tests et Vérification

### 1. Vérifier dans le navigateur

Ouvrir les DevTools et inspecter le `<head>` :
```javascript
// Lister toutes les balises hreflang
document.querySelectorAll('link[rel="alternate"][hreflang]')
```

### 2. Utiliser les outils SEO

- **Google Search Console** : Section "Ciblage international"
- **Screaming Frog** : Vérification des balises hreflang
- **Ahrefs Site Audit** : Analyse hreflang

### 3. Tester le changement de langue

1. Charger la page en français : `?lang=fr#/`
2. Vérifier les balises hreflang dans le `<head>`
3. Changer de langue via le sélecteur
4. Vérifier que l'URL est mise à jour
5. Recharger la page → La langue doit être préservée

## Considérations Futures

### Migration vers URLs propres (optionnel)

Si vous migrez vers un routage sans hash :

**Avant :**
```
https://dalil-tounes.com?lang=fr#/concept
```

**Après :**
```
https://dalil-tounes.com/fr/concept
```

**Modifications nécessaires :**
1. Implémenter un routeur côté serveur (React Router, Next.js)
2. Modifier `generateHreflangUrls()` dans SEOHead.tsx
3. Mettre à jour `useHreflangPath` pour détecter le path segment

### Ajout de nouvelles langues

Pour ajouter une langue (ex: espagnol `es`) :

1. **SEOHead.tsx** : Ajouter 'es' à `SUPPORTED_LANGUAGES`
2. **LanguageContext.tsx** : Ajouter 'es' à `SUPPORTED_LANGUAGES`
3. **i18n.ts** : Ajouter les traductions espagnoles
4. Rebuild l'application

## Performances

**Impact :** Négligeable

- Les balises sont générées une seule fois au montage du composant
- Nettoyage automatique lors du démontage
- Pas d'appels réseau supplémentaires
- Taille HTML : +0.5 Ko par page (6 balises × ~80 caractères)

## Compatibilité

**Navigateurs :** Tous (HTML standard)

**Moteurs de recherche :**
- ✅ Google (recommandé officiellement)
- ✅ Bing
- ✅ Yandex
- ⚠️ Baidu (support partiel)

## Bonnes Pratiques Respectées

1. ✅ **Auto-référence** : Chaque page a une balise pour sa propre langue
2. ✅ **x-default** : Version par défaut pour les langues non supportées
3. ✅ **Bidirectionnel** : Toutes les versions pointent vers toutes les autres
4. ✅ **Canonical** : URL canonique définie pour chaque page
5. ✅ **Cohérence** : Même structure d'URL pour toutes les langues
6. ✅ **Validation** : Langues validées avant utilisation

## Ressources

- [Google Guide hreflang](https://developers.google.com/search/docs/advanced/crawling/localized-versions)
- [Moz Guide hreflang](https://moz.com/learn/seo/hreflang-tag)
- [Ahrefs hreflang Guide](https://ahrefs.com/blog/hreflang-tags/)

---

**Date de mise en œuvre :** 15 Mars 2026
**Version :** 1.0
**Status :** ✅ Production Ready
**Testeur :** Agent Claude
