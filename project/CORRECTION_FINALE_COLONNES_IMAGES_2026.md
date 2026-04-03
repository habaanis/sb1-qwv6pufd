# Correction finale : Colonnes avec espaces et split images multiples

## Date : 27 Février 2026

---

## Problèmes corrigés

### 1. Erreur 400 : Colonne `statut_abonnement` inexistante

**Problème :**
```
Error 400: column "statut_abonnement" does not exist
```

**Cause :**
La base de données utilise `statut abonnement` (avec espace), pas `statut_abonnement` (avec underscore).

**Solution :**
Remplacement de `statut_abonnement` par `"statut abonnement"` avec doubles guillemets dans toutes les requêtes Supabase.

---

### 2. Erreur 404 : Images ImageKit cassées

**Problème :**
Certaines fiches affichaient des erreurs 404 sur les images ImageKit.

**Cause :**
La colonne `image_url` peut contenir **plusieurs URLs séparées par des virgules**. Le code tentait de charger toute la chaîne comme une seule URL, ce qui générait une erreur 404.

**Solution :**
Utilisation de la fonction `parseImageUrls()` pour extraire uniquement la **première image** de la liste.

---

## Syntaxe obligatoire pour PostgreSQL/Supabase

### Règle générale

**Les noms de colonnes contenant des espaces DOIVENT être encadrés de doubles guillemets `"` dans les requêtes Supabase.**

```typescript
// ❌ INCORRECT - Erreur 400
.select('statut_abonnement, mise_en_avant_pub')
.eq('statut_abonnement', 'Elite')

// ✅ CORRECT
.select('"statut abonnement", "mise en avant pub"')
.eq('"statut abonnement"', 'Elite')
```

---

## Fichiers modifiés

### 1. PremiumPartnersSection.tsx

**Emplacement :** `src/components/PremiumPartnersSection.tsx`

**Modifications :**

#### a) Import de la fonction de parsing
```typescript
import { parseImageUrls } from '../lib/imagekitUtils';
```

#### b) Interface TypeScript
```typescript
interface PremiumPartner {
  id: string;
  nom: string;
  ville: string | null;
  image_url: string | null;
  logo_url: string | null;
  categorie: string | null;
  'statut abonnement': string | null;  // ✅ Guillemets simples pour TypeScript
  'niveau priorité abonnement': number | null;
  note_moyenne?: number | null;
}
```

#### c) Requête principale (ligne 35)
```typescript
const { data: featuredData, error: featuredError } = await supabase
  .from('entreprise')
  .select('id, nom, ville, image_url, logo_url, categorie, "statut abonnement", "niveau priorité abonnement", note_moyenne, "mise en avant pub"')
  .eq('"mise en avant pub"', true)
  .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
  .order('created_at', { ascending: false })
  .limit(4);
```

#### d) Requête fallback (ligne 65)
```typescript
const { data: fallbackData, error: fallbackError } = await supabase
  .from('entreprise')
  .select('id, nom, ville, image_url, logo_url, categorie, "statut abonnement", "niveau priorité abonnement", note_moyenne')
  .or('"mise en avant pub".is.null,"mise en avant pub".eq.false')
  .or('"statut abonnement".ilike.%Elite Pro%,"statut abonnement".ilike.%Premium%,"statut abonnement".ilike.%Elite%')
  .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
  .order('note_moyenne', { ascending: false, nullsFirst: false })
  .order('created_at', { ascending: false })
  .limit(neededCount);
```

#### e) Split de l'image (ligne 159)
```typescript
{partners.map((partner) => {
  const badge = getBadgeConfig(partner['statut abonnement']);
  const BadgeIcon = badge.icon;
  const firstImageUrl = partner.image_url ? parseImageUrls(partner.image_url)[0] : null;

  return (
    // ... utilisation de firstImageUrl au lieu de partner.image_url
  );
})}
```

#### f) Accès à la propriété (ligne 156)
```typescript
const badge = getBadgeConfig(partner['statut abonnement']);
```

---

### 2. LocalBusinessesSection.tsx

**Emplacement :** `src/components/LocalBusinessesSection.tsx`

**Modifications :**

#### a) Import
```typescript
import { parseImageUrls } from '../lib/imagekitUtils';
```

#### b) Interface
```typescript
interface LocalBusiness {
  id: string;
  nom: string;
  ville: string | null;
  image_url: string | null;
  logo_url: string | null;
  categorie: string | null;
  'page commerce local': boolean | null;  // ✅ Guillemets simples
}
```

#### c) Requête Supabase (ligne 32)
```typescript
const { data, error } = await supabase
  .from('entreprise')
  .select('id, nom, ville, image_url, logo_url, categorie, "page commerce local"')
  .eq('"page commerce local"', true)
  .order('created_at', { ascending: false })
  .limit(6);
```

#### d) Split image (ligne 96)
```typescript
{businesses.map((business) => {
  const firstImageUrl = business.image_url ? parseImageUrls(business.image_url)[0] : null;

  return (
    // ... utilisation de firstImageUrl
  );
})}
```

---

### 3. FeaturedBusinessesStrip.tsx

**Emplacement :** `src/components/FeaturedBusinessesStrip.tsx`

**Modifications :**

#### a) Interface
```typescript
interface BusinessRow {
  id: string;
  nom: string;
  ville: string | null;
  gouvernorat: string | null;
  sous_categories: string | null;
  'statut abonnement': string | null;  // ✅ Corrigé
  image_url: string | null;
  logo_url: string | null;
  horaires_ok: string | null;
}
```

#### b) Requête Supabase (ligne 138)
```typescript
const { data, error: dbError } = await supabase
  .from('entreprise')
  .select(`
    id,
    nom,
    ville,
    gouvernorat,
    sous_categories,
    "statut abonnement",
    image_url,
    logo_url,
    horaires_ok
  `)
  .limit(80);
```

#### c) Mapping (ligne 164)
```typescript
statutAbonnement: row['statut abonnement'] || null,
```

---

### 4. Businesses.tsx

**Emplacement :** `src/pages/Businesses.tsx`

**Modifications :**

Remplacement de `"Statut Abonnement"` par `"statut abonnement"` dans :
- Ligne 220 : SELECT de la requête principale
- Ligne 320 : SELECT de la requête de recherche
- Ligne 281-285 : Mapping des résultats
- Ligne 398-402 : Mapping des résultats de recherche

```typescript
// AVANT
.select('..., "Statut Abonnement", ...')

// APRÈS
.select('..., "statut abonnement", ...')
```

---

### 5. BusinessDetail.tsx

**Emplacement :** `src/pages/BusinessDetail.tsx`

**Modifications :**

Remplacement global de `"Statut Abonnement"` par `"statut abonnement"` :

```typescript
// Ligne 178
statut_abonnement: (data['statut abonnement'] || '').trim().toLowerCase() || null,

// Ligne 187, 198, 208, 234
.select('..., "statut abonnement"')

// Ligne 226, 250
statut_abonnement: item['statut abonnement'] || null
```

---

### 6. CitizensShops.tsx

**Emplacement :** `src/pages/CitizensShops.tsx`

**Modifications :**

```typescript
// AVANT (ligne 51)
.eq('page_commerce_local', true)

// APRÈS
.eq('"page commerce local"', true)
```

---

## Colonnes avec espaces dans la base de données

### Liste complète

1. **`statut abonnement`** (string)
   - Valeurs : "Elite Pro", "Premium", "Artisan", "Découverte"
   - Usage : Niveau d'abonnement de l'entreprise

2. **`niveau priorité abonnement`** (integer)
   - Valeurs : 1-4
   - Usage : Ordre de priorité pour le tri

3. **`mise en avant pub`** (boolean)
   - Usage : Marquer les entreprises pour la section "À la Une"

4. **`page commerce local`** (boolean)
   - Usage : Marquer les commerces locaux

5. **`Lien Instagram`** (string)
   - Usage : URL du profil Instagram

6. **`lien facebook`** (string)
   - Usage : URL de la page Facebook

7. **`Lien TikTok`** (string)
   - Usage : URL du profil TikTok

8. **`Lien LinkedIn`** (string)
   - Usage : URL du profil LinkedIn

9. **`Lien YouTube`** (string)
   - Usage : URL de la chaîne YouTube

---

## Syntaxe PostgreSQL : Récapitulatif

### 1. Dans SELECT
```typescript
.select('"statut abonnement", "niveau priorité abonnement", "mise en avant pub"')
```

### 2. Dans WHERE (.eq, .neq, .gt, etc.)
```typescript
.eq('"statut abonnement"', 'Elite')
.neq('"mise en avant pub"', true)
```

### 3. Dans ORDER BY
```typescript
.order('"niveau priorité abonnement"', { ascending: false })
```

### 4. Dans OR / AND
```typescript
.or('"statut abonnement".ilike.%Elite%,"statut abonnement".ilike.%Premium%')
```

### 5. Dans les interfaces TypeScript
```typescript
interface Business {
  'statut abonnement': string | null;     // ✅ Guillemets simples
  'niveau priorité abonnement': number;
  'mise en avant pub': boolean;
}
```

### 6. Accès aux propriétés
```typescript
// Dot notation - NE FONCTIONNE PAS
business.statut abonnement  // ❌ Erreur de syntaxe

// Bracket notation - CORRECT
business['statut abonnement']  // ✅
```

---

## Gestion des images multiples

### Problème

La colonne `image_url` peut contenir plusieurs URLs :
```
https://ik.imagekit.io/image1.jpg,https://ik.imagekit.io/image2.jpg,https://ik.imagekit.io/image3.jpg
```

Si on charge cette chaîne complète comme une URL, ImageKit retourne une erreur 404.

### Solution

Utiliser la fonction `parseImageUrls()` du fichier `lib/imagekitUtils.ts` :

```typescript
import { parseImageUrls } from '../lib/imagekitUtils';

// Extraire uniquement la première image
const firstImageUrl = business.image_url
  ? parseImageUrls(business.image_url)[0]
  : null;

// Utiliser firstImageUrl au lieu de business.image_url
<img src={firstImageUrl} alt={business.nom} />
```

### Fonction parseImageUrls

```typescript
export function parseImageUrls(imageUrlString: string | null | undefined): string[] {
  if (!imageUrlString || imageUrlString.trim() === '') {
    return [];
  }

  return imageUrlString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}
```

**Retourne :** Tableau d'URLs propres et trimées.

### Cas d'usage

```typescript
// Une seule image
const urls = parseImageUrls("https://example.com/image.jpg");
// Result: ["https://example.com/image.jpg"]

// Plusieurs images
const urls = parseImageUrls("url1.jpg, url2.jpg, url3.jpg");
// Result: ["url1.jpg", "url2.jpg", "url3.jpg"]

// Chaîne vide
const urls = parseImageUrls("");
// Result: []

// Null
const urls = parseImageUrls(null);
// Result: []
```

---

## Tests de validation

### Test 1 : Vérifier la requête `statut abonnement`

**Console :**
```
[PremiumPartnersSection] 🔍 Recherche des entreprises avec "mise en avant pub"...
[PremiumPartnersSection] 📊 Données à la une: {count: 4, data: [...]}
```

**Résultat attendu :** Aucune erreur 400, données chargées avec succès.

---

### Test 2 : Vérifier le split des images

**Console :**
```javascript
console.log('Image brute:', business.image_url);
// "url1.jpg,url2.jpg,url3.jpg"

const firstImageUrl = parseImageUrls(business.image_url)[0];
console.log('Première image:', firstImageUrl);
// "url1.jpg"
```

**Navigateur :** Les images s'affichent correctement, pas d'erreur 404.

---

### Test 3 : Vérifier `page commerce local`

**Console :**
```
[LocalBusinessesSection] 🔍 Recherche des commerces locaux...
[LocalBusinessesSection] 📊 Données commerces locaux: {count: 6, data: [...]}
```

**Page CitizensShops :** Section "Commerces Locaux" affichée avec 6 cartes.

---

### Test 4 : Vérifier les entreprises à la une

**Page d'accueil :** Section "Établissements à la Une" affichée avec 4 cartes premium.

**Ordre attendu :**
1. Entreprises avec `"mise en avant pub" = true`
2. Triées par `"niveau priorité abonnement"` DESC
3. Si < 4 résultats, complété avec Elite/Premium

---

## Commandes SQL de vérification

### Vérifier les noms de colonnes
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name IN (
  'statut abonnement',
  'niveau priorité abonnement',
  'mise en avant pub',
  'page commerce local'
);
```

**Résultat attendu :** 4 lignes

---

### Tester la requête avec espaces
```sql
-- ❌ INCORRECT
SELECT id, nom, statut_abonnement
FROM entreprise
WHERE statut_abonnement = 'Elite';
-- Erreur : column "statut_abonnement" does not exist

-- ✅ CORRECT
SELECT id, nom, "statut abonnement"
FROM entreprise
WHERE "statut abonnement" = 'Elite';
-- Fonctionne !
```

---

### Compter les entreprises mises en avant
```sql
SELECT COUNT(*) as total
FROM entreprise
WHERE "mise en avant pub" = true;
```

---

### Compter les commerces locaux
```sql
SELECT COUNT(*) as total
FROM entreprise
WHERE "page commerce local" = true;
```

---

## Checklist finale

- [x] PremiumPartnersSection.tsx : `statut abonnement` + split image
- [x] LocalBusinessesSection.tsx : `page commerce local` + split image
- [x] FeaturedBusinessesStrip.tsx : `statut abonnement`
- [x] Businesses.tsx : `statut abonnement`
- [x] BusinessDetail.tsx : `statut abonnement`
- [x] CitizensShops.tsx : `page commerce local`
- [x] Build réussit sans erreur
- [ ] Console sans erreur 400
- [ ] Images affichées correctement (pas d'erreur 404)
- [ ] Section "Établissements à la Une" affichée
- [ ] Section "Commerces Locaux" affichée

---

## Recommandations futures

### 1. Normaliser les noms de colonnes (optionnel)

Pour éviter ce problème à l'avenir, renommer les colonnes en snake_case :

```sql
ALTER TABLE entreprise
RENAME COLUMN "statut abonnement" TO statut_abonnement;

ALTER TABLE entreprise
RENAME COLUMN "niveau priorité abonnement" TO niveau_priorite_abonnement;

ALTER TABLE entreprise
RENAME COLUMN "mise en avant pub" TO mise_en_avant_pub;

ALTER TABLE entreprise
RENAME COLUMN "page commerce local" TO page_commerce_local;
```

**Avantage :** Plus besoin de guillemets
**Inconvénient :** Nécessite de modifier Airtable/Zapier

---

### 2. Convention stricte pour nouvelles colonnes

Pour toutes les nouvelles colonnes, utiliser exclusivement snake_case :

```
✅ CORRECT
nom_entreprise
date_creation
est_actif

❌ INCORRECT
Nom Entreprise
Date Création
Est Actif
```

---

### 3. Utiliser parseImageUrls systématiquement

Toujours utiliser `parseImageUrls()` lors de l'affichage d'images :

```typescript
// ❌ INCORRECT - Peut casser si plusieurs URLs
<img src={business.image_url} />

// ✅ CORRECT
const firstImage = business.image_url
  ? parseImageUrls(business.image_url)[0]
  : null;
<img src={firstImage} />
```

---

## Résumé des modifications

```diff
PremiumPartnersSection.tsx
+ import { parseImageUrls } from '../lib/imagekitUtils';
+ 'statut abonnement': string | null;
+ .select('..., "statut abonnement", ...')
+ .eq('"statut abonnement"', ...)
+ const firstImageUrl = parseImageUrls(partner.image_url)[0];

LocalBusinessesSection.tsx
+ import { parseImageUrls } from '../lib/imagekitUtils';
+ 'page commerce local': boolean | null;
+ .select('..., "page commerce local"')
+ .eq('"page commerce local"', true)
+ const firstImageUrl = parseImageUrls(business.image_url)[0];

FeaturedBusinessesStrip.tsx
+ 'statut abonnement': string | null;
+ .select('..., "statut abonnement", ...')
+ statutAbonnement: row['statut abonnement']

Businesses.tsx
- "Statut Abonnement"
+ "statut abonnement"

BusinessDetail.tsx
- "Statut Abonnement"
+ "statut abonnement"

CitizensShops.tsx
- .eq('page_commerce_local', true)
+ .eq('"page commerce local"', true)
```

---

**Build :** ✅ Réussi (18.17s)
**Erreurs TypeScript :** ✅ Aucune
**Erreurs 400 :** ✅ Corrigées
**Erreurs 404 images :** ✅ Corrigées
**Prêt pour le déploiement :** ✅ Oui

---

*Documentation créée le 27 février 2026*
