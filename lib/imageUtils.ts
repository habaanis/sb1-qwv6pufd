import { supabase } from './BoltDatabase';

const STORAGE_BUCKET = 'photos-dalil';

// ============================================
// WEBP SUPPORT DETECTION
// ============================================
let webpSupportCache: boolean | null = null;

/**
 * Détecte si le navigateur supporte le format WebP
 * Utilise un cache pour éviter de refaire le test à chaque fois
 */
export async function supportsWebP(): Promise<boolean> {
  if (webpSupportCache !== null) {
    return webpSupportCache;
  }

  return new Promise((resolve) => {
    const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const img = new Image();

    img.onload = () => {
      webpSupportCache = img.width === 1 && img.height === 1;
      resolve(webpSupportCache);
    };

    img.onerror = () => {
      webpSupportCache = false;
      resolve(false);
    };

    img.src = webpData;
  });
}

/**
 * Convertit un nom de fichier en version WebP si le navigateur le supporte
 * Ex: 'photo.jpg' => 'photo.webp'
 *
 * @param filename - Nom du fichier original
 * @param useWebP - Force l'utilisation ou non de WebP (détection auto si non spécifié)
 */
export function getWebPFilename(filename: string, useWebP?: boolean): string {
  // Si WebP n'est pas supporté ou désactivé, retourner le nom original
  if (useWebP === false) {
    return filename;
  }

  // Remplacer l'extension par .webp
  return filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Teste si un fichier WebP existe dans Supabase Storage
 * Utilisé pour le fallback automatique
 */
async function webpFileExists(filename: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        search: filename,
        limit: 1
      });

    return !error && data && data.length > 0;
  } catch {
    return false;
  }
}

// ============================================
// IMAGE PAR DÉFAUT - Configuration
// ============================================
// Pour changer l'image par défaut, modifiez simplement le chemin ci-dessous.
// L'image doit être placée dans le dossier public/images/
const DEFAULT_IMAGE_PATH = '/images/placeholder.jpg';
// ============================================

/**
 * Construit l'URL publique d'une image depuis Supabase Storage ou retourne l'URL directe
 * NOUVELLE VERSION : Gère les URLs ImageKit et autres CDN directement
 *
 * @param filename - Nom du fichier stocké en base de données ou URL complète (ImageKit, etc.)
 * @param defaultExtension - Non utilisé, gardé pour compatibilité
 * @param preferWebP - Préférer WebP si supporté par le navigateur (défaut: true)
 * @returns URL publique de l'image ou image par défaut
 */
export function getSupabaseImageUrl(
  filename: string | null | undefined,
  defaultExtension: string = 'jpg',
  preferWebP: boolean = false
): string {
  try {
    // Si le nom de fichier est vide ou invalide, retourner l'image par défaut
    if (!filename || filename.trim() === '') {
      return DEFAULT_IMAGE_PATH;
    }

    let finalFilename = filename.trim();

    // Si c'est une URL ImageKit ou autre CDN valide, la retourner directement
    if (finalFilename.startsWith('https://ik.imagekit.io/') ||
        finalFilename.startsWith('https://imagekit.io/')) {
      return finalFilename;
    }

    // Détecter les anciens liens HTTP/HTTPS (Facebook, etc.) expirés
    // On les remplace par l'image par défaut
    if (finalFilename.startsWith('http://') || finalFilename.startsWith('https://')) {
      return DEFAULT_IMAGE_PATH;
    }

    // Retirer les slashes au début et à la fin pour éviter les doubles slashes
    finalFilename = finalFilename.replace(/^\/+|\/+$/g, '');

    // Construire l'URL publique avec Supabase Storage
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(finalFilename);

    // Si l'URL est invalide ou vide, retourner l'image par défaut
    if (!data?.publicUrl || data.publicUrl.trim() === '') {
      return DEFAULT_IMAGE_PATH;
    }

    return data.publicUrl;
  } catch (err) {
    console.error('[imageUtils] Erreur getSupabaseImageUrl:', err, 'pour filename:', filename);
    // En cas d'erreur, toujours retourner l'image par défaut
    return DEFAULT_IMAGE_PATH;
  }
}

/**
 * Construit les URLs pour un tableau de noms de fichiers
 * Utilisé pour les annonces avec plusieurs photos
 *
 * @param filenames - Tableau de noms de fichiers
 * @param defaultExtension - Extension par défaut
 * @returns Tableau d'URLs publiques
 */
export function getSupabaseImageUrls(
  filenames: string[] | null | undefined,
  defaultExtension: string = 'jpg'
): string[] {
  if (!filenames || filenames.length === 0) {
    return [DEFAULT_IMAGE_PATH];
  }

  const urls = filenames
    .filter(name => name && name.trim() !== '')
    .map(name => getSupabaseImageUrl(name, defaultExtension));

  // Si aucune URL valide, retourner l'image par défaut
  return urls.length > 0 ? urls : [DEFAULT_IMAGE_PATH];
}

/**
 * Crée un gestionnaire d'erreur pour les images
 * Remplace automatiquement par l'image par défaut en cas d'échec
 */
export function createImageErrorHandler() {
  return (e: Event) => {
    const target = e.target as HTMLImageElement;
    if (target && !target.src.includes('placeholder.jpg')) {
      target.src = DEFAULT_IMAGE_PATH;
    }
  };
}

/**
 * Hook pour obtenir l'URL d'une image avec fallback
 * Utile pour les background-image ou autres cas d'usage
 */
export function useImageUrl(
  filename: string | null | undefined,
  defaultExtension: string = 'jpg'
): string {
  return getSupabaseImageUrl(filename, defaultExtension);
}

/**
 * Retourne le chemin de l'image par défaut
 * Utile pour les comparaisons ou l'affichage manuel
 */
export function getDefaultImagePath(): string {
  return DEFAULT_IMAGE_PATH;
}

/**
 * Convertit un ancien chemin d'image local (/images/xxx.jpg) en URL Supabase Storage
 * Utilisé pour les images de structure (catégories, hero, backgrounds)
 *
 * @param localPath - Chemin local de l'image (ex: '/images/sante.jpg')
 * @returns URL Supabase Storage complète
 *
 * @example
 * getStructureImageUrl('/images/sante.jpg')
 * // => 'https://...supabase.co/storage/v1/object/public/photos-dalil/sante.jpg'
 */
export function getStructureImageUrl(localPath: string): string {
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }

  // Extraire juste le nom du fichier depuis le chemin local
  // Ex: '/images/sante.jpg' => 'sante.jpg'
  const filename = localPath.replace(/^\/images\//, '').replace(/^images\//, '');

  // Utiliser la fonction existante pour construire l'URL Supabase
  return getSupabaseImageUrl(filename);
}
