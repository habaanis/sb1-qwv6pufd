/**
 * Tests pour les utilitaires de nettoyage des notes Google
 */

import {
  cleanGoogleRating,
  cleanReviewCount,
  formatRating,
  cleanBusinessRatings,
  sortByRating,
  getTopRated
} from './ratingUtils';

// Tests de nettoyage des notes
describe('cleanGoogleRating', () => {
  test('nettoie les virgules en points', () => {
    expect(cleanGoogleRating('4,5')).toBe(4.5);
    expect(cleanGoogleRating('3,8')).toBe(3.8);
    expect(cleanGoogleRating('4,95')).toBe(4.95);
  });

  test('accepte les nombres déjà formatés', () => {
    expect(cleanGoogleRating('4.5')).toBe(4.5);
    expect(cleanGoogleRating(4.5)).toBe(4.5);
    expect(cleanGoogleRating(4)).toBe(4);
  });

  test('gère les valeurs invalides', () => {
    expect(cleanGoogleRating(null)).toBe(0);
    expect(cleanGoogleRating(undefined)).toBe(0);
    expect(cleanGoogleRating('')).toBe(0);
    expect(cleanGoogleRating('invalid')).toBe(0);
    expect(cleanGoogleRating('abc')).toBe(0);
  });

  test('limite les valeurs entre 0 et 5', () => {
    expect(cleanGoogleRating(6)).toBe(5);
    expect(cleanGoogleRating(-1)).toBe(0);
    expect(cleanGoogleRating('10')).toBe(5);
  });

  test('gère les formats mixtes', () => {
    expect(cleanGoogleRating('4,5/5')).toBe(4.5);
    expect(cleanGoogleRating('Note: 4,8')).toBe(4.8);
    expect(cleanGoogleRating('★4,7')).toBe(4.7);
  });
});

// Tests de nettoyage du compteur d'avis
describe('cleanReviewCount', () => {
  test('nettoie les nombres', () => {
    expect(cleanReviewCount('124')).toBe(124);
    expect(cleanReviewCount(124)).toBe(124);
    expect(cleanReviewCount('1,234')).toBe(1234);
  });

  test('gère les valeurs invalides', () => {
    expect(cleanReviewCount(null)).toBe(0);
    expect(cleanReviewCount(undefined)).toBe(0);
    expect(cleanReviewCount('')).toBe(0);
    expect(cleanReviewCount('abc')).toBe(0);
  });

  test('supprime les caractères non numériques', () => {
    expect(cleanReviewCount('124 avis')).toBe(124);
    expect(cleanReviewCount('(456)')).toBe(456);
  });

  test('ignore les nombres négatifs', () => {
    expect(cleanReviewCount(-10)).toBe(0);
  });
});

// Tests de formatage
describe('formatRating', () => {
  test('formate une note avec étoile', () => {
    const result = formatRating(4.5, 124);
    expect(result.display).toBe('⭐ 4.5');
    expect(result.full).toBe('⭐ 4.5 (124 avis)');
    expect(result.hasRating).toBe(true);
  });

  test('formate sans nombre d\'avis', () => {
    const result = formatRating(4.5);
    expect(result.display).toBe('⭐ 4.5');
    expect(result.full).toBe('⭐ 4.5');
    expect(result.hasRating).toBe(true);
  });

  test('gère les notes nulles', () => {
    const result = formatRating(0);
    expect(result.display).toBe('Non noté');
    expect(result.full).toBe('Non noté');
    expect(result.hasRating).toBe(false);
  });

  test('formate avec différentes locales', () => {
    const resultAr = formatRating(4.5, 124, 'ar');
    expect(resultAr.full).toContain('تقييمات');

    const resultEn = formatRating(4.5, 124, 'en');
    expect(resultEn.full).toContain('reviews');
  });
});

// Tests de nettoyage d'entreprises
describe('cleanBusinessRatings', () => {
  test('nettoie les notes d\'une entreprise', () => {
    const business = {
      id: '1',
      name: 'Test',
      note_google: '4,5',
      nombre_avis: '124'
    };

    const cleaned = cleanBusinessRatings(business);
    expect(cleaned.note_google_clean).toBe(4.5);
    expect(cleaned.nombre_avis_clean).toBe(124);
  });

  test('gère les colonnes avec espaces', () => {
    const business = {
      id: '1',
      name: 'Test',
      'Note Google Globale': '4,8',
      'Compteur Avis Google': '456'
    };

    const cleaned = cleanBusinessRatings(business);
    expect(cleaned.note_google_clean).toBe(4.8);
    expect(cleaned.nombre_avis_clean).toBe(456);
  });

  test('gère les données manquantes', () => {
    const business = {
      id: '1',
      name: 'Test'
    };

    const cleaned = cleanBusinessRatings(business);
    expect(cleaned.note_google_clean).toBe(0);
    expect(cleaned.nombre_avis_clean).toBe(0);
  });
});

// Tests de tri
describe('sortByRating', () => {
  test('trie par note décroissante', () => {
    const businesses = [
      { id: '1', note_google_clean: 3.5 },
      { id: '2', note_google_clean: 4.8 },
      { id: '3', note_google_clean: 4.2 }
    ];

    const sorted = sortByRating(businesses);
    expect(sorted[0].note_google_clean).toBe(4.8);
    expect(sorted[1].note_google_clean).toBe(4.2);
    expect(sorted[2].note_google_clean).toBe(3.5);
  });

  test('met les entreprises sans note en bas', () => {
    const businesses = [
      { id: '1', note_google_clean: 0 },
      { id: '2', note_google_clean: 4.5 },
      { id: '3', note_google_clean: 0 }
    ];

    const sorted = sortByRating(businesses);
    expect(sorted[0].note_google_clean).toBe(4.5);
    expect(sorted[1].note_google_clean).toBe(0);
    expect(sorted[2].note_google_clean).toBe(0);
  });
});

// Tests Top N
describe('getTopRated', () => {
  test('retourne le Top N', () => {
    const businesses = [
      { id: '1', nom: 'A', note_google: '3.5' },
      { id: '2', nom: 'B', note_google: '4.8' },
      { id: '3', nom: 'C', note_google: '4.2' },
      { id: '4', nom: 'D', note_google: '4.9' },
      { id: '5', nom: 'E', note_google: '3.8' }
    ];

    const top3 = getTopRated(businesses, 3);
    expect(top3).toHaveLength(3);
    expect(top3[0].note_google_clean).toBe(4.9);
    expect(top3[1].note_google_clean).toBe(4.8);
    expect(top3[2].note_google_clean).toBe(4.2);
  });

  test('gère moins d\'entreprises que demandé', () => {
    const businesses = [
      { id: '1', nom: 'A', note_google: '4.5' },
      { id: '2', nom: 'B', note_google: '4.2' }
    ];

    const top10 = getTopRated(businesses, 10);
    expect(top10).toHaveLength(2);
  });
});

console.log('✅ Tous les tests de nettoyage des notes sont configurés');
