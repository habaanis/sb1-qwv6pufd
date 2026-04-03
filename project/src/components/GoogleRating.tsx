import { Star } from 'lucide-react';
import { cleanGoogleRating, cleanReviewCount, formatRating } from '../lib/ratingUtils';
import { useLanguage } from '../context/LanguageContext';

interface GoogleRatingProps {
  rating?: string | number | null;
  reviewCount?: string | number | null;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function GoogleRating({
  rating,
  reviewCount,
  showCount = true,
  size = 'medium',
  className = ''
}: GoogleRatingProps) {
  const { language } = useLanguage();

  // Nettoyer les données
  const cleanedRating = cleanGoogleRating(rating);
  const cleanedCount = cleanReviewCount(reviewCount);

  // Formater pour l'affichage
  const formatted = formatRating(cleanedRating, cleanedCount, language);

  // Si pas de note, ne rien afficher ou afficher "Non noté"
  if (!formatted.hasRating) {
    return null; // Ou retourner <span className="text-gray-400 text-sm">{formatted.display}</span>
  }

  // Classes selon la taille
  const sizeClasses = {
    small: 'text-xs gap-0.5',
    medium: 'text-sm gap-1',
    large: 'text-base gap-1.5'
  };

  const starSizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {/* Étoile dorée */}
      <Star
        className={`${starSizeClasses[size]} fill-yellow-400 text-yellow-400`}
        strokeWidth={2}
      />

      {/* Note */}
      <span className="font-semibold text-gray-900 dark:text-white">
        {formatted.value}
      </span>

      {/* Nombre d'avis */}
      {showCount && cleanedCount > 0 && (
        <span className="text-gray-600 dark:text-gray-400">
          ({formatted.count})
        </span>
      )}
    </div>
  );
}

/**
 * Badge de note pour les cartes d'entreprise
 */
interface RatingBadgeProps {
  rating?: string | number | null;
  reviewCount?: string | number | null;
  className?: string;
}

export function RatingBadge({ rating, reviewCount, className = '' }: RatingBadgeProps) {
  const { language } = useLanguage();

  const cleanedRating = cleanGoogleRating(rating);
  const cleanedCount = cleanReviewCount(reviewCount);

  if (cleanedRating === 0) {
    return null;
  }

  const formatted = formatRating(cleanedRating, cleanedCount, language);

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 ${className}`}
    >
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" strokeWidth={2} />
      <span className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
        {formatted.value}
      </span>
      {cleanedCount > 0 && (
        <span className="text-xs text-yellow-700 dark:text-yellow-400">
          ({cleanedCount})
        </span>
      )}
    </div>
  );
}

/**
 * Affichage complet avec étoiles visuelles
 */
interface DetailedRatingProps {
  rating?: string | number | null;
  reviewCount?: string | number | null;
  showStars?: boolean;
  className?: string;
}

export function DetailedRating({
  rating,
  reviewCount,
  showStars = true,
  className = ''
}: DetailedRatingProps) {
  const { language } = useLanguage();

  const cleanedRating = cleanGoogleRating(rating);
  const cleanedCount = cleanReviewCount(reviewCount);

  if (cleanedRating === 0) {
    return null;
  }

  const formatted = formatRating(cleanedRating, cleanedCount, language);

  // Générer les étoiles visuelles
  const fullStars = Math.floor(cleanedRating);
  const hasHalfStar = cleanedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Note numérique */}
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" strokeWidth={2} />
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formatted.value}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">/ 5</span>
      </div>

      {/* Étoiles visuelles */}
      {showStars && (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: fullStars }).map((_, i) => (
            <Star
              key={`full-${i}`}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
              strokeWidth={1.5}
            />
          ))}
          {hasHalfStar && (
            <div className="relative w-4 h-4">
              <Star className="w-4 h-4 text-yellow-400" strokeWidth={1.5} />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" strokeWidth={1.5} />
              </div>
            </div>
          )}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star
              key={`empty-${i}`}
              className="w-4 h-4 text-gray-300 dark:text-gray-600"
              strokeWidth={1.5}
            />
          ))}
        </div>
      )}

      {/* Nombre d'avis */}
      {cleanedCount > 0 && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatted.count}
        </span>
      )}
    </div>
  );
}
