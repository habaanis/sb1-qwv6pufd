# Guide d'utilisation - Images depuis Supabase Storage

## Vue d'ensemble

Votre application a été configurée pour charger automatiquement toutes les images depuis Supabase Storage (bucket `photos-dalil`). Le système inclut une gestion intelligente des erreurs avec image de remplacement.

---

## Configuration actuelle

### Bucket Supabase Storage
- **Nom du bucket** : `photos-dalil`
- **Type** : Public
- Les noms de fichiers en base de données correspondent exactement aux noms dans le Storage

### Image par défaut
- **Chemin** : `/public/images/placeholder.jpg`
- **Action requise** : Vous devez ajouter cette image manuellement
- Cette image s'affiche automatiquement quand :
  - Le nom de fichier en base est vide
  - L'image ne peut pas être chargée
  - L'URL Supabase est invalide

---

## Comment ça fonctionne

### 1. Fonctions utilitaires (`src/lib/imageUtils.ts`)

#### `getSupabaseImageUrl(filename, defaultExtension)`
Construit l'URL publique d'une image depuis Supabase Storage.

**Paramètres** :
- `filename` : Nom du fichier stocké en base de données
- `defaultExtension` : Extension par défaut si absente (défaut: 'jpg')

**Exemple** :
```typescript
import { getSupabaseImageUrl } from '../lib/imageUtils';

// Si en base : "photo123"
const imageUrl = getSupabaseImageUrl("photo123");
// Résultat : URL Supabase vers "photo123.jpg"

// Si en base : "image.png"
const imageUrl = getSupabaseImageUrl("image.png");
// Résultat : URL Supabase vers "image.png" (extension préservée)
```

#### `getSupabaseImageUrls(filenames, defaultExtension)`
Pour les tableaux d'images (annonces avec plusieurs photos).

**Exemple** :
```typescript
const photos = ["photo1", "photo2.jpg", "photo3"];
const urls = getSupabaseImageUrls(photos);
// Résultat : Array d'URLs Supabase
```

---

### 2. Composant React (`src/components/ImageWithFallback.tsx`)

Composant `<img>` amélioré avec gestion automatique du fallback.

**Usage** :
```tsx
import { ImageWithFallback } from '../components/ImageWithFallback';

<ImageWithFallback
  src={business.image_url}  // Nom du fichier depuis la base
  alt="Description"
  className="w-full h-full object-cover"
  defaultExtension="jpg"    // Optionnel
/>
```

**Avantages** :
- Construit automatiquement l'URL Supabase
- Ajoute l'extension si manquante
- Affiche le placeholder en cas d'erreur
- Accepte toutes les props standard de `<img>`

---

## Composants modifiés

Les composants suivants ont été mis à jour pour utiliser Supabase Storage :

### Composants
1. **FeaturedBusinessesStrip** - Images d'entreprises dans différentes variantes (home, businesses, citizens, shops)
2. **AnnouncementCard** - Image principale des annonces
3. **AnnouncementDetail** - Carousel d'images pour les annonces
4. **BannerAdsCarousel** - Bannières publicitaires d'entreprises
5. **ImageWithFallback** - Nouveau composant réutilisable

### Pages
6. **BusinessDetail** - Image de profil d'entreprise et images similaires

---

## Actions requises

### 1. Ajouter l'image placeholder
Créez ou ajoutez une image à :
```
/public/images/placeholder.jpg
```

**Recommandations** :
- Format : JPG, PNG ou WEBP
- Dimensions : 800x600 pixels minimum
- Poids : Moins de 200 KB
- Contenu suggéré :
  - Image neutre avec texte "Image non disponible"
  - Logo de votre application
  - Fond de couleur avec icône

### 2. Vérifier les noms de fichiers en base de données
Assurez-vous que les noms de fichiers dans votre base de données correspondent exactement aux fichiers dans Supabase Storage.

**Champs concernés** :
- `entreprise.image_url` (string)
- `featured_events.image_url` (string)
- `annonces_locales.photo_url` (array de strings)

### 3. Uploader les images dans Supabase Storage
Uploadez toutes vos images dans le bucket `photos-dalil` en respectant les noms stockés en base.

---

## Personnalisation

### Changer l'image par défaut

Éditez le fichier `/src/lib/imageUtils.ts` ligne 11 :

```typescript
// AVANT
const DEFAULT_IMAGE_PATH = '/images/placeholder.jpg';

// APRÈS (exemple)
const DEFAULT_IMAGE_PATH = '/images/mon-placeholder-custom.jpg';
```

### Changer l'extension par défaut

Lors de l'utilisation des fonctions, passez un deuxième paramètre :

```typescript
// Pour les PNG
const imageUrl = getSupabaseImageUrl(filename, 'png');

// Pour les WEBP
const imageUrl = getSupabaseImageUrl(filename, 'webp');
```

### Changer le bucket

Éditez le fichier `/src/lib/imageUtils.ts` ligne 3 :

```typescript
const STORAGE_BUCKET = 'photos-dalil';
// Changez en : const STORAGE_BUCKET = 'mon-bucket';
```

---

## Exemples d'utilisation

### Exemple 1 : Image simple
```tsx
import { ImageWithFallback } from '../components/ImageWithFallback';

function MyComponent({ business }) {
  return (
    <ImageWithFallback
      src={business.image_url}
      alt={business.nom}
      className="w-32 h-32 rounded-full"
    />
  );
}
```

### Exemple 2 : Background image
```tsx
import { getSupabaseImageUrl } from '../lib/imageUtils';

function Banner({ imageFilename }) {
  const bgImage = getSupabaseImageUrl(imageFilename);

  return (
    <div
      style={{ backgroundImage: `url(${bgImage})` }}
      className="h-64 bg-cover"
    >
      {/* Contenu */}
    </div>
  );
}
```

### Exemple 3 : Carousel d'images
```tsx
import { getSupabaseImageUrls } from '../lib/imageUtils';

function ImageCarousel({ photos }) {
  const imageUrls = getSupabaseImageUrls(photos);

  return (
    <div>
      {imageUrls.map((url, index) => (
        <img key={index} src={url} alt={`Photo ${index + 1}`} />
      ))}
    </div>
  );
}
```

---

## Dépannage

### Les images ne s'affichent pas
1. Vérifiez que le bucket `photos-dalil` existe dans Supabase
2. Vérifiez que le bucket est configuré en mode public
3. Vérifiez que les noms en base correspondent aux fichiers uploadés
4. Vérifiez les permissions RLS du bucket

### L'image placeholder ne s'affiche pas
1. Assurez-vous que `/public/images/placeholder.jpg` existe
2. Vérifiez que le chemin dans `imageUtils.ts` est correct
3. Testez l'accès direct à `http://localhost:5173/images/placeholder.jpg`

### Les extensions sont incorrectes
Si vos images utilisent des extensions différentes (.png, .webp, etc.), vous avez deux options :
1. Stocker les noms avec extension complète en base de données
2. Modifier le paramètre `defaultExtension` lors de l'appel

---

## Structure des fichiers créés/modifiés

```
src/
├── lib/
│   └── imageUtils.ts              # Fonctions utilitaires
├── components/
│   ├── ImageWithFallback.tsx      # Composant React (NOUVEAU)
│   ├── FeaturedBusinessesStrip.tsx (MODIFIÉ)
│   ├── AnnouncementCard.tsx       (MODIFIÉ)
│   ├── AnnouncementDetail.tsx     (MODIFIÉ)
│   └── BannerAdsCarousel.tsx      (MODIFIÉ)
└── pages/
    └── BusinessDetail.tsx         (MODIFIÉ)

public/
└── images/
    ├── PLACEHOLDER_INFO.txt       # Instructions
    └── placeholder.jpg            # À AJOUTER
```

---

## Résumé

Votre application charge maintenant toutes les images depuis Supabase Storage avec :
- Construction automatique des URLs
- Ajout automatique des extensions manquantes
- Gestion des erreurs avec image de remplacement
- Code commenté pour faciliter les modifications futures

Le build a été testé et fonctionne correctement.
