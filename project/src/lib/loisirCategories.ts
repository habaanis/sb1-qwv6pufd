export const LOISIRS_CATEGORIES_KEYS = [
  { value: '', key: 'all', emoji: '' },
  { value: 'Saveurs & Traditions', key: 'flavors', emoji: '🍽️' },
  { value: 'Musées & Patrimoine', key: 'heritage', emoji: '🏛️' },
  { value: 'Escapades & Nature', key: 'nature', emoji: '🌄' },
  { value: 'Festivals & Artisanat', key: 'festivals', emoji: '🎭' },
  { value: 'Sport & Aventure', key: 'sports', emoji: '🏃' }
] as const;

export type LoisirCategory = typeof LOISIRS_CATEGORIES_KEYS[number]['value'];
