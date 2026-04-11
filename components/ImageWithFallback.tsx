import React from 'react';
import { getSupabaseImageUrl } from '../lib/imageUtils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  defaultExtension?: string;
}

/**
 * Composant Image avec gestion automatique du fallback
 * Utilise Supabase Storage et affiche l'image par défaut en cas d'erreur
 *
 * Usage:
 * <ImageWithFallback src="filename.jpg" alt="Description" className="..." />
 *
 * Le composant:
 * 1. Récupère automatiquement l'URL depuis Supabase Storage
 * 2. Ajoute l'extension .jpg si manquante (modifiable via defaultExtension)
 * 3. Affiche l'image placeholder en cas d'erreur de chargement
 */
export function ImageWithFallback({
  src,
  alt,
  defaultExtension = 'jpg',
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(() => {
    return getSupabaseImageUrl(src, defaultExtension);
  });
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Réinitialiser l'image si src change
    setHasError(false);
    setImgSrc(getSupabaseImageUrl(src, defaultExtension));
  }, [src, defaultExtension]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (hasError) return; // Éviter boucle infinie

    setHasError(true);
    setImgSrc('/images/placeholder.jpg');

    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
    />
  );
}

export default ImageWithFallback;
