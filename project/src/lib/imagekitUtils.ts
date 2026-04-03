/**
 * Utilitaires pour la gestion des images ImageKit
 * Optimisation automatique des tailles et transformations
 */

const DEFAULT_IMAGE_PATH = '/images/placeholder.jpg';

/**
 * Paramètres de transformation ImageKit pour différents cas d'usage
 */
export const ImageKitTransforms = {
  // Cartes de visite (BusinessCard)
  CARD_LOGO: 'tr=w-400,h-300,fo-auto,q-85',

  // Galerie photo (BusinessDetail)
  GALLERY_THUMBNAIL: 'tr=w-500,h-400,fo-auto,q-85',
  GALLERY_FULL: 'tr=w-1000,f-auto',

  // Images de couverture
  COVER_IMAGE: 'tr=w-800,h-600,fo-auto,q-85',

  // Vignettes petites
  THUMBNAIL_SMALL: 'tr=w-200,h-150,fo-auto,q-80',

  // Featured sections
  FEATURED_IMAGE: 'tr=w-600,h-400,fo-auto,q-85',
};

/**
 * Vérifie si une URL est une URL ImageKit
 */
export function isImageKitUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith('https://ik.imagekit.io/') ||
         trimmed.startsWith('https://imagekit.io/');
}

/**
 * Ajoute des paramètres de transformation à une URL ImageKit
 * Si l'URL contient déjà des paramètres, ils sont préservés
 */
export function addImageKitTransform(
  url: string | null | undefined,
  transform: string
): string {
  if (!url || url.trim() === '') {
    return DEFAULT_IMAGE_PATH;
  }

  const trimmedUrl = url.trim();

  // Si ce n'est pas une URL ImageKit, retourner telle quelle
  if (!isImageKitUrl(trimmedUrl)) {
    return trimmedUrl;
  }

  // Si l'URL contient déjà des paramètres de transformation, ne pas les dupliquer
  if (trimmedUrl.includes('?tr=')) {
    return trimmedUrl;
  }

  // Ajouter les paramètres de transformation
  return `${trimmedUrl}?${transform}`;
}

/**
 * Convertit une chaîne d'URLs séparées par des virgules en tableau
 * Utilisé pour image_url qui peut contenir plusieurs URLs
 */
export function parseImageUrls(imageUrlString: string | null | undefined): string[] {
  if (!imageUrlString || imageUrlString.trim() === '') {
    return [];
  }

  return imageUrlString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Obtient l'URL optimisée pour un logo (carte de visite)
 * IMPORTANT: Prend toujours la première URL si plusieurs séparées par virgules
 */
export function getCardLogoUrl(logoUrl: string | null | undefined): string {
  try {
    if (!logoUrl || logoUrl.trim() === '') {
      return DEFAULT_IMAGE_PATH;
    }

    // Prendre la première URL si plusieurs sont séparées par des virgules
    const firstUrl = logoUrl.split(',')[0].trim();

    if (!firstUrl) {
      return DEFAULT_IMAGE_PATH;
    }

    if (isImageKitUrl(firstUrl)) {
      return addImageKitTransform(firstUrl, ImageKitTransforms.CARD_LOGO);
    }

    return firstUrl;
  } catch (err) {
    console.error('[imagekitUtils] Erreur getCardLogoUrl:', err, 'pour logoUrl:', logoUrl);
    return DEFAULT_IMAGE_PATH;
  }
}

/**
 * Obtient l'URL optimisée pour une image de couverture (première image)
 */
export function getCoverImageUrl(imageUrls: string | null | undefined): string {
  try {
    const urls = parseImageUrls(imageUrls);

    if (urls.length === 0) {
      return DEFAULT_IMAGE_PATH;
    }

    const firstUrl = urls[0];

    if (isImageKitUrl(firstUrl)) {
      return addImageKitTransform(firstUrl, ImageKitTransforms.COVER_IMAGE);
    }

    return firstUrl;
  } catch (err) {
    console.error('[imagekitUtils] Erreur getCoverImageUrl:', err, 'pour imageUrls:', imageUrls);
    return DEFAULT_IMAGE_PATH;
  }
}

/**
 * Obtient toutes les URLs pour une galerie photo avec transformations
 */
export function getGalleryImageUrls(
  imageUrls: string | null | undefined,
  size: 'thumbnail' | 'full' = 'thumbnail'
): string[] {
  try {
    const urls = parseImageUrls(imageUrls);

    if (urls.length === 0) {
      return [DEFAULT_IMAGE_PATH];
    }

    const transform = size === 'thumbnail'
      ? ImageKitTransforms.GALLERY_THUMBNAIL
      : ImageKitTransforms.GALLERY_FULL;

    return urls.map(url => {
      if (isImageKitUrl(url)) {
        return addImageKitTransform(url, transform);
      }
      return url;
    });
  } catch (err) {
    console.error('[imagekitUtils] Erreur getGalleryImageUrls:', err, 'pour imageUrls:', imageUrls);
    return [DEFAULT_IMAGE_PATH];
  }
}

/**
 * Obtient l'URL optimisée pour une section featured
 */
export function getFeaturedImageUrl(
  logoUrl: string | null | undefined,
  imageUrls: string | null | undefined
): string {
  try {
    // Priorité au logo
    if (logoUrl && logoUrl.trim() !== '') {
      if (isImageKitUrl(logoUrl)) {
        return addImageKitTransform(logoUrl, ImageKitTransforms.FEATURED_IMAGE);
      }
      return logoUrl;
    }

    // Sinon, première image de la galerie
    const urls = parseImageUrls(imageUrls);
    if (urls.length > 0) {
      const firstUrl = urls[0];
      if (isImageKitUrl(firstUrl)) {
        return addImageKitTransform(firstUrl, ImageKitTransforms.FEATURED_IMAGE);
      }
      return firstUrl;
    }

    return DEFAULT_IMAGE_PATH;
  } catch (err) {
    console.error('[imagekitUtils] Erreur getFeaturedImageUrl:', err);
    return DEFAULT_IMAGE_PATH;
  }
}

/**
 * Obtient le chemin de l'image par défaut
 */
export function getDefaultImagePath(): string {
  return DEFAULT_IMAGE_PATH;
}
