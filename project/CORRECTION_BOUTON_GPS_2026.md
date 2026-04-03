# Correction du bouton "Autour de moi" - 1er avril 2026

## Problème identifié

Le bouton "Autour de moi" sur la page d'accueil causait une page blanche :
- Utilisait `useNavigate()` de React Router HORS contexte Router
- L'application utilise un système de navigation par **hash** custom (pas React Router)
- Erreur : "useNavigate() may be used only in the context of a <Router> component"

## Architecture de navigation découverte

L'application **N'utilise PAS React Router** mais un système custom dans `App.tsx` :
- Navigation par hash : `#/autour-de-moi`, `#/entreprises`, etc.
- Listener sur `hashchange` (ligne 188 de App.tsx)
- Fonction `handleHashChange()` qui route vers les composants
- État interne `currentPage` pour gérer l'affichage

## Corrections appliquées

### 1. Suppression de l'import React Router
**Avant :**
```typescript
import { useNavigate } from 'react-router-dom'; // ❌ Cause erreur
const navigate = useNavigate(); // ❌ Hors contexte Router
```

**Après :**
```typescript
// ✅ Aucun import React Router nécessaire
```

### 2. Correction du bouton (lignes 171-195)
**Avant (causait page blanche) :**
```typescript
<button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    const searchValue = searchInput?.value || '';

    // ❌ ERREUR: useNavigate() hors contexte Router
    if (searchValue.trim()) {
      navigate(`/autour-de-moi?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/autour-de-moi');
    }
  }}
>
```

**Après (fonctionne) :**
```typescript
<button
  onClick={(e) => {
    e.preventDefault(); // ✅ Empêche comportement par défaut
    e.stopPropagation(); // ✅ Empêche propagation événement

    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    const searchValue = searchInput?.value || '';

    // ✅ Navigation par hash (système custom de l'app)
    const newHash = searchValue.trim()
      ? `#/autour-de-moi?search=${encodeURIComponent(searchValue.trim())}`
      : '#/autour-de-moi';

    window.location.hash = newHash; // ✅ Pas de rechargement de page
  }}
>
```

## Améliorations

1. **Navigation fluide** : Utilise `window.location.hash` (sans rechargement complet)
2. **Prévention du scroll** : `e.preventDefault()` empêche le retour en haut
3. **Transmission de recherche** : Le terme saisi (ex: "avocat") est passé via `?search=avocat`
4. **Isolation d'événement** : `e.stopPropagation()` évite les effets de bord
5. **Compatible avec App.tsx** : S'intègre au système de routing existant

## Flux de navigation corrigé

```
Accueil
  ↓
Utilisateur tape "Avocat" dans la barre de recherche
  ↓
Clic sur "Autour de moi"
  ↓
window.location.hash = "#/autour-de-moi?search=avocat"
  ↓
Événement "hashchange" déclenché
  ↓
App.tsx → handleHashChange() détecte #/autour-de-moi
  ↓
setCurrentPage('aroundMe') (ligne 120 de App.tsx)
  ↓
Rendu du composant <AroundMe />
  ↓
AroundMe lit le paramètre search de l'URL
  ↓
Affichage des avocats dans le rayon GPS
```

## Page AroundMe (déjà fonctionnelle)

La page destination était déjà bien configurée :
- Lit le paramètre `search` de l'URL (ligne 72-75)
- Appelle `search_entreprise_smart` avec le filtre (ligne 168-174)
- Filtre ensuite par distance GPS (ligne 191)
- Trie par pertinence puis distance (ligne 193-194)

## Erreur 404 GitHub

L'erreur `ERR_BLOCKED_BY_CLIENT` et le 404 sur `.keep` de GitHub proviennent de :
- Extensions navigateur (AdBlock, Privacy Badger, etc.)
- Pas de référence GitHub dans le code du projet

**Action** : Aucune correction nécessaire côté code. C'est un comportement normal des extensions de blocage.

## Tests de validation

✅ Build réussi : `npm run build` (9.97s)
✅ Aucune erreur TypeScript bloquante
✅ Navigation par hash correctement implémentée
✅ Paramètres URL transmis correctement
✅ Compatible avec le système de routing custom

## Fichiers modifiés

- `/src/pages/Home.tsx` (lignes 171-195) : Correction du bouton "Autour de moi"

## Leçon apprise

L'application utilise un **système de routing custom par hash**, pas React Router. Toute navigation doit utiliser :
```typescript
window.location.hash = '#/ma-page?param=value';
```

Ne **JAMAIS** utiliser :
```typescript
import { useNavigate } from 'react-router-dom'; // ❌ Cause page blanche
```
