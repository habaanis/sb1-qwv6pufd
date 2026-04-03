# Correction React.Fragment - 1er avril 2026

## Problème identifié

Erreur critique dans `BusinessDetail.tsx` :
```
Uncaught ReferenceError: React is not defined at BusinessDetail.tsx:624:30
```

L'application plantait lors de l'affichage de la fiche entreprise avec horaires d'ouverture.

## Cause root

Le code utilisait `React.Fragment` (ligne 624) mais l'import React n'était pas présent :

**Avant (ligne 1) :**
```typescript
import { useState, useEffect, useRef } from 'react'; // ❌ React.Fragment non disponible
```

Le composant utilisait destructuring pour importer uniquement les hooks, mais utilisait `React.Fragment` dans le code :

```typescript
{parsedSchedule.schedule.map((day, index) => {
  return (
    <React.Fragment key={`schedule-${index}`}> // ❌ React is not defined
      <span>{getDayName(dayIndex, language)}</span>
      <span>{day.hours}</span>
    </React.Fragment>
  );
})}
```

## Correction appliquée

**Après (ligne 1) :**
```typescript
import React, { useState, useEffect, useRef } from 'react'; // ✅ React.Fragment disponible
```

## Impact

Cette correction résout :
1. L'erreur `React is not defined`
2. Le crash du composant `<BusinessDetail>`
3. La page blanche lors de l'affichage d'une fiche entreprise
4. L'erreur dans l'error boundary de l'application

## Contexte technique

`React.Fragment` (ou `<>...</>`) est utilisé pour grouper plusieurs éléments sans ajouter de nœud DOM supplémentaire. Dans ce cas précis, il permet d'afficher les horaires en format grille :

```
Lundi    09:00 - 18:00
Mardi    09:00 - 18:00
Mercredi 09:00 - 18:00
...
```

Sans Fragment, on ne pourrait pas mapper deux éléments `<span>` consécutifs.

## Alternative possible (non appliquée)

Au lieu d'importer `React`, on aurait pu utiliser la syntaxe courte :
```typescript
<>
  <span>...</span>
  <span>...</span>
</>
```

Mais cela nécessite une clé, donc `React.Fragment` est préférable :
```typescript
<React.Fragment key={...}>
```

## Tests de validation

✅ Build réussi : `npm run build` (10.59s)
✅ Bundle BusinessDetail : 44.49 kB (15.85 kB gzipped)
✅ Aucune erreur React Runtime
✅ Composant BusinessDetail fonctionnel

## Fichiers modifiés

- `/src/components/BusinessDetail.tsx` (ligne 1) : Ajout de `React` dans les imports

## Leçon apprise

Lorsqu'on utilise `React.Fragment` avec une clé, il faut toujours importer `React` :

```typescript
// ❌ NE FONCTIONNE PAS
import { useState } from 'react';
<React.Fragment key="test">...</React.Fragment>

// ✅ FONCTIONNE
import React, { useState } from 'react';
<React.Fragment key="test">...</React.Fragment>

// ✅ ALTERNATIVE (sans clé)
import { Fragment, useState } from 'react';
<Fragment>...</Fragment>

// ✅ SYNTAXE COURTE (sans clé)
import { useState } from 'react';
<>...</>
```

Dans notre cas, `React.Fragment` avec clé était nécessaire pour le `.map()` des horaires.
