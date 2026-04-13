/**
 * Utilitaires pour le nettoyage et l'affichage des notes Google
 */

/**
 * Nettoie une note Google en transformant les virgules en points
 * et en s'assurant que c'est un nombre valide
 *
 * @param rating - Note brute (peut être string avec virgule, number, null, etc.)
 * @returns Note nettoyée en nombre ou 0 si invalide
 *
 * @example
 * cleanGoogleRating('4,5') => 4.5
 * cleanGoogleRating('4.8') => 4.8
 * cleanGoogleRating(4.8) => 4.8
 * cleanGoogleRating('invalid') => 0
 * cleanGoogleRating(null) => 0
 */
export function cleanGoogleRating(rating: string | number | null | undefined): number {
  if (rating === null || rating === undefined || rating === '') {
    return 0;
  }

  // Si c'est déjà un nombre
  if (typeof rating === 'number') {
    return isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
  }

  // Si c'est une string, nettoyer
  const cleaned = String(rating)
    .trim()
    .replace(/,/g, '.') // Remplacer virgules par points
    .replace(/[^\d.]/g, ''); // Garder seulement chiffres et points

  const parsed = parseFloat(cleaned);

  // Vérifier que c'est un nombre valide entre 0 et 5
  if (isNaN(parsed)) {
    return 0;
  }

  return Math.min(5, Math.max(0, parsed));
}

/**
 * Nettoie un compteur d'avis
 *
 * @param count - Nombre d'avis brut
 * @returns Nombre d'avis nettoyé ou 0 si invalide
 *
 * @example
 * cleanReviewCount('124') => 124
 * cleanReviewCount(124) => 124
 * cleanReviewCount('invalid') => 0
 */
export function cleanReviewCount(count: string | number | null | undefined): number {
  if (count === null || count === undefined || count === '') {
    return 0;
  }

  if (typeof count === 'number') {
    return isNaN(count) ? 0 : Math.max(0, Math.floor(count));
  }

  const cleaned = String(count)
    .trim()
    .replace(/[^\d]/g, ''); // Garder seulement les chiffres

  const parsed = parseInt(cleaned, 10);

  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Formate une note pour l'affichage avec une étoile
 *
 * @param rating - Note nettoyée
 * @param reviewCount - Nombre d'avis (optionnel)
 * @returns Objet avec les éléments formatés
 *
 * @example
 * formatRating(4.5, 124) => { display: '⭐ 4.5', full: '⭐ 4.5 (124 avis)' }
 * formatRating(4.5) => { display: '⭐ 4.5', full: '⭐ 4.5' }
 * formatRating(0) => { display: 'Non noté', full: 'Non noté' }
 */
export function formatRating(
  rating: number,
  reviewCount?: number,
  locale: string = 'fr'
): {
  display: string;
  full: string;
  hasRating: boolean;
  stars: string;
  value: string;
  count: string;
} {
  if (rating === 0 || isNaN(rating)) {
    const noRating = locale === 'ar' ? 'غير مصنف' :
                     locale === 'en' ? 'Not rated' :
                     locale === 'it' ? 'Non valutato' :
                     locale === 'ru' ? 'Не оценено' :
                     'Non noté';

    return {
      display: noRating,
      full: noRating,
      hasRating: false,
      stars: '',
      value: '',
      count: ''
    };
  }

  // Formater la note avec 1 décimale
  const formattedRating = rating.toFixed(1);
  const stars = '⭐';
  const display = `${stars} ${formattedRating}`;

  let full = display;
  let countText = '';

  if (reviewCount && reviewCount > 0) {
    const reviewText = locale === 'ar' ? 'تقييمات' :
                       locale === 'en' ? 'reviews' :
                       locale === 'it' ? 'recensioni' :
                       locale === 'ru' ? 'отзывов' :
                       'avis';

    countText = `${reviewCount} ${reviewText}`;
    full = `${display} (${countText})`;
  }

  return {
    display,
    full,
    hasRating: true,
    stars,
    value: formattedRating,
    count: countText
  };
}

/**
 * Nettoie et prépare les données d'entreprise avec notes
 * Utilisé après fetch Supabase pour normaliser les données
 *
 * @param business - Objet entreprise brut de Supabase
 * @returns Entreprise avec notes nettoyées
 */
export function cleanBusinessRatings<T extends Record<string, any>>(business: T): T & {
  note_google_clean: number;
  nombre_avis_clean: number;
} {
  return {
    ...business,
    note_google_clean: cleanGoogleRating(business.note_google || business['Note Google Globale']),
    nombre_avis_clean: cleanReviewCount(business.nombre_avis || business['Compteur Avis Google'])
  };
}

/**
 * Trie un tableau d'entreprises par note Google décroissante
 * Les entreprises sans note sont en bas
 *
 * @param businesses - Tableau d'entreprises
 * @returns Tableau trié par note décroissante
 */
export function sortByRating<T extends { note_google_clean?: number }>(businesses: T[]): T[] {
  return [...businesses].sort((a, b) => {
    const ratingA = a.note_google_clean || 0;
    const ratingB = b.note_google_clean || 0;

    // Les entreprises avec note en premier
    if (ratingA > 0 && ratingB === 0) return -1;
    if (ratingA === 0 && ratingB > 0) return 1;

    // Tri décroissant par note
    return ratingB - ratingA;
  });
}

/**
 * Obtient le Top N des entreprises par note Google
 *
 * @param businesses - Tableau d'entreprises
 * @param limit - Nombre d'entreprises à retourner (défaut: 10)
 * @returns Top N entreprises par note
 */
export function getTopRated<T extends Record<string, any>>(
  businesses: T[],
  limit: number = 10
): (T & { note_google_clean: number; nombre_avis_clean: number })[] {
  const cleaned = businesses.map(cleanBusinessRatings);
  const sorted = sortByRating(cleaned);
  return sorted.slice(0, limit);
}

/**
 * Génère les étoiles visuelles pour une note
 *
 * @param rating - Note entre 0 et 5
 * @returns String avec étoiles pleines et vides
 *
 * @example
 * generateStars(4.5) => '★★★★☆'
 * generateStars(3.0) => '★★★☆☆'
 */
export function generateStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '★'.repeat(fullStars) +
         (hasHalfStar ? '⯨' : '') +
         '☆'.repeat(emptyStars);
}

/**
 * Vérifie si une entreprise a une note valide
 *
 * @param business - Objet entreprise
 * @returns true si l'entreprise a une note > 0
 */
export function hasValidRating(business: any): boolean {
  const rating = cleanGoogleRating(business.note_google || business['Note Google Globale']);
  return rating > 0;
}
