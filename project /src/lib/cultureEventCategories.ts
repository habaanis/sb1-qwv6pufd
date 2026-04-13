export const SECTEURS_CULTURE = [
  'Saveurs & Traditions',
  'Musée & Patrimoine',
  'Escapades & Nature',
  'Festivals & artisanat',
  'Sport & Aventure',
  'Art & Culture',
  'Sorties & Soirées'
] as const;

export type SecteurCulture = typeof SECTEURS_CULTURE[number];

export const SECTEURS_CONFIG = [
  {
    value: 'Saveurs & Traditions',
    label: 'Saveurs & Traditions',
    icon: '🍽️',
    color: 'from-orange-500 to-red-500',
  },
  {
    value: 'Musée & Patrimoine',
    label: 'Musée & Patrimoine',
    icon: '🏛️',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    value: 'Escapades & Nature',
    label: 'Escapades & Nature',
    icon: '🌿',
    color: 'from-green-500 to-emerald-500',
  },
  {
    value: 'Festivals & artisanat',
    label: 'Festivals & artisanat',
    icon: '🎭',
    color: 'from-rose-500 to-pink-500',
  },
  {
    value: 'Sport & Aventure',
    label: 'Sport & Aventure',
    icon: '⚡',
    color: 'from-sky-500 to-blue-500',
  },
  {
    value: 'Art & Culture',
    label: 'Art & Culture',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500',
  },
  {
    value: 'Sorties & Soirées',
    label: 'Sorties & Soirées',
    icon: '🎉',
    color: 'from-blue-500 to-cyan-500',
  },
];
