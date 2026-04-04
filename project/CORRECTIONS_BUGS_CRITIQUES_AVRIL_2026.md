# Corrections des Bugs Critiques - Avril 2026

## 🔴 Problèmes Identifiés et Corrigés

### 1. **BusinessDetail ne récupérait PAS l'ID depuis l'URL**

**Symptôme** : Page blanche quand on clique sur une carte ou un résultat de recherche

**Cause** : Le composant `BusinessDetail.tsx` n'utilisait pas `useParams()` pour récupérer l'ID depuis l'URL. Il attendait l'ID uniquement en prop, mais dans le routing moderne React Router, l'ID vient de l'URL.

**Fichier** : `src/components/BusinessDetail.tsx`

**Correction** :
```typescript
// ❌ AVANT - Pas d'import useParams
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

// ✅ APRÈS - Ajout de useParams et useNavigate
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
```

```typescript
// ❌ AVANT - businessId vient SEULEMENT de la prop
export const BusinessDetail = ({
  businessId,
  business: businessProp,
  onNavigateBack,
  onClose,
  asModal = false
}: BusinessDetailProps) => {
  // businessId était undefined si pas passé en prop !

// ✅ APRÈS - businessId vient de l'URL en priorité
export const BusinessDetail = ({
  businessId: businessIdProp,
  business: businessProp,
  onNavigateBack,
  onClose,
  asModal = false
}: BusinessDetailProps) => {
  // Récupérer l'ID depuis l'URL si pas passé en prop
  const { id: urlId, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const businessId = businessIdProp || urlId; // ✅ Priorité à la prop, sinon URL
```

**Impact** : ✅ Les pages de détail entreprise s'affichent maintenant correctement

---

### 2. **Home.tsx exigeait des props qui n'étaient jamais fournies**

**Symptôme** : Erreurs TypeScript, navigation cassée depuis la page d'accueil

**Cause** : `Home.tsx` attendait des props obligatoires (`onNavigate`, `onSuggestBusiness`, etc.) mais dans `AppRouter.tsx`, Home était appelé sans aucune prop : `<Route path="/" element={<Home />} />`

**Fichier** : `src/pages/Home.tsx`

**Correction** :
```typescript
// ❌ AVANT - Props obligatoires
interface HomeProps {
  onNavigate: (page: ...) => void;  // ❌ Obligatoire
  onSuggestBusiness: () => void;     // ❌ Obligatoire
  onNavigateToBusiness: (id: string) => void; // ❌ Obligatoire
}

export const Home = ({ onNavigate, onSuggestBusiness, ... }: HomeProps) => {
  // onNavigate était undefined -> crash !

// ✅ APRÈS - Props optionnelles avec fallback React Router
interface HomeProps {
  onNavigate?: (page: ...) => void;  // ✅ Optionnel
  onSuggestBusiness?: () => void;    // ✅ Optionnel
  onNavigateToBusiness?: (id: string) => void; // ✅ Optionnel
}

export const Home = ({ onNavigate, onSuggestBusiness, ... }: HomeProps = {}) => {
  const navigate = useNavigate(); // ✅ Fallback moderne

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page as any); // Si fourni, utilise la prop
    } else {
      const pageMap = {
        'businesses': '/businesses',
        'citizens': '/citizens',
        // ...
      };
      navigate(pageMap[page] || '/'); // ✅ Sinon, navigation React Router
    }
  };
```

**Impact** : ✅ La page d'accueil fonctionne maintenant sans crash

---

### 3. **App.tsx ignorait le slug dans les URLs entreprise**

**Symptôme** : URLs comme `#/entreprise/uuid/nom-entreprise` étaient tronquées en `/business/uuid` (slug perdu)

**Cause** : `App.tsx` extrayait seulement le premier segment après `entreprise/` et ignorait le slug SEO

**Fichier** : `src/App.tsx`

**Correction** :
```typescript
// ❌ AVANT - Prend seulement l'ID, ignore le slug
if (cleanPath.startsWith('business/') || cleanPath.startsWith('entreprises/')) {
  const businessId = cleanPath.split('/')[1]; // ❌ Prend seulement index 1
  navigate(`/business/${businessId}`, { replace: true }); // ❌ Slug perdu
  return;
}

// ✅ APRÈS - Extrait ID ET slug
if (cleanPath.startsWith('business/') || cleanPath.startsWith('entreprise/') || cleanPath.startsWith('entreprises/')) {
  const segments = cleanPath.split('/').slice(1); // ✅ Tous les segments
  if (segments.length > 0) {
    const businessId = segments[0];
    const slug = segments[1] || ''; // ✅ Slug optionnel
    if (slug) {
      navigate(`/business/${businessId}/${slug}`, { replace: true }); // ✅ Slug préservé
    } else {
      navigate(`/business/${businessId}`, { replace: true });
    }
  }
  return;
}
```

**Impact** : ✅ Les URLs SEO avec slugs sont maintenant préservées

---

### 4. **Routes React Router ne supportaient pas le slug optionnel**

**Symptôme** : Navigation vers `/business/uuid/slug` donnait une 404

**Cause** : Les routes étaient définies comme `/business/:id` sans support du slug optionnel

**Fichier** : `src/AppRouter.tsx`

**Correction** :
```tsx
// ❌ AVANT - Pas de support du slug
<Route path="/business/:id" element={<BusinessDetail />} />
<Route path="/entreprises/:id" element={<BusinessDetail />} />

// ✅ APRÈS - Slug optionnel (:slug?)
<Route path="/business/:id/:slug?" element={<BusinessDetail />} />
<Route path="/entreprise/:id/:slug?" element={<BusinessDetail />} />
<Route path="/entreprises/:id/:slug?" element={<BusinessDetail />} />
<Route path="/p/:slug" element={<BusinessDetail />} />
```

**Impact** : ✅ Toutes les variations d'URLs entreprise fonctionnent maintenant

---

### 5. **Bouton retour utilisait des props au lieu de navigate(-1)**

**Symptôme** : Bouton retour ne fonctionnait pas si `onNavigateBack` n'était pas fourni

**Cause** : Le composant dépendait d'une prop `onNavigateBack` qui n'était jamais passée

**Fichier** : `src/components/BusinessDetail.tsx`

**Correction** :
```typescript
// ❌ AVANT - Dépendant de la prop uniquement
const handleClose = onClose || onNavigateBack; // ❌ Peut être undefined

// ✅ APRÈS - Fallback vers navigate(-1)
const handleClose = onClose || onNavigateBack || (() => navigate(-1)); // ✅ Toujours défini
```

**Impact** : ✅ Le bouton retour fonctionne dans tous les cas

---

## 📊 Résumé des Fichiers Modifiés

| Fichier | Lignes modifiées | Type de correction |
|---------|------------------|-------------------|
| `src/components/BusinessDetail.tsx` | 1-5, 115-157, 401-425 | Ajout useParams + navigate |
| `src/pages/Home.tsx` | 1-4, 17-56 | Props optionnelles + navigate |
| `src/App.tsx` | 52-71 | Support slug entreprise |
| `src/AppRouter.tsx` | 77-80 | Routes avec slug optionnel |
| `src/components/UnifiedSearchBar.tsx` | 23-29, 133-136 | Interface + navigation entreprise |
| `supabase/migrations/20260403214909_add_id_slug_to_autocomplete.sql` | Nouveau | Ajout entreprise_id dans RPC |

---

## ✅ Tests de Validation

### Test 1 : Recherche et navigation
```
1. Ouvrir la page d'accueil (/)
2. Taper "resto" dans la barre de recherche
3. Cliquer sur un résultat
4. ✅ La page de détail doit s'afficher
5. ✅ L'URL doit être /business/uuid ou /business/uuid/slug
```

### Test 2 : Clic sur carte entreprise
```
1. Aller sur /businesses
2. Cliquer sur une carte entreprise
3. ✅ La page de détail doit s'afficher
4. ✅ Le bouton retour doit fonctionner
```

### Test 3 : URL directe
```
1. Ouvrir directement https://dalil-tounes.com/business/[uuid]
2. ✅ La page doit se charger correctement
3. ✅ Les données doivent s'afficher
```

### Test 4 : Hash vers routing moderne
```
1. Ouvrir https://dalil-tounes.com/#/entreprise/[uuid]/[slug]
2. ✅ Redirection automatique vers /business/[uuid]/[slug]
3. ✅ La page s'affiche correctement
```

---

## 🚀 Déploiement en Production

### Étape 1 : Appliquer la migration Supabase
La migration `20260403214909_add_id_slug_to_autocomplete.sql` doit être appliquée manuellement sur votre base de données Supabase en production :

```sql
-- Connectez-vous à votre dashboard Supabase
-- SQL Editor > New Query
-- Copiez le contenu de supabase/migrations/20260403214909_add_id_slug_to_autocomplete.sql
-- Exécutez la requête
```

### Étape 2 : Build et déploiement
```bash
npm run build
# Le build génère le dossier dist/
# Déployez sur Netlify via drag & drop ou CLI
```

### Étape 3 : Vérification post-déploiement
1. ✅ Testez la recherche sur la page d'accueil
2. ✅ Cliquez sur une carte entreprise
3. ✅ Testez le bouton retour
4. ✅ Vérifiez les URLs SEO avec slugs

---

## 📝 Notes Importantes

### Migration Supabase
⚠️ **CRITIQUE** : Si la recherche ne retourne toujours aucun résultat après déploiement, c'est que la migration `20260403214909_add_id_slug_to_autocomplete.sql` n'a pas été appliquée sur votre base de données Supabase en production.

### Console Logs
Les logs suivants dans la console confirment que tout fonctionne :
```
✅ BusinessId from URL: [uuid]
✅ Final businessId: [uuid]
✅ [Autocomplete] RPC Results: [...]
```

### Compatibilité
- ✅ React Router DOM v7.13.1
- ✅ Hash routing (#/) transformé en routing moderne (/)
- ✅ Backward compatible avec anciennes URLs
- ✅ Support SEO avec slugs

---

## 🎯 Résultat Final

**AVANT** :
- ❌ Barre de recherche ne retournait aucun résultat
- ❌ Clic sur carte/résultat → page blanche
- ❌ URLs avec slug perdaient le slug
- ❌ Navigation cassée

**APRÈS** :
- ✅ Recherche fonctionne avec suggestions intelligentes
- ✅ Clic sur carte/résultat → affiche la fiche détaillée
- ✅ URLs SEO préservées (/business/uuid/nom-entreprise)
- ✅ Navigation fluide avec React Router
- ✅ Bouton retour fonctionnel partout
- ✅ Build réussi sans erreurs

---

Date : 3 avril 2026
Build : ✅ Succès (dist/ généré)
Status : 🟢 Prêt pour production
