import type { Lang } from '@/lib/i18n';

/** Normalisation (FR/EN/IT/RU + diacritiques arabes) */
const stripLatinAccents = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const stripArabicDiacritics = (s: string) =>
  (s || '').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

export const geoNorm = (s: string, lang: Lang) => {
  let out = stripLatinAccents(s || '');
  if (lang === 'ar') out = stripArabicDiacritics(out);
  // espaces superflus & tirets
  out = out.replace(/\s+/g, ' ').replace(/-/g, ' ').trim();
  return out;
};

/** Aliases de base (exhaustifs à compléter au besoin) */
type AliasEntry = {
  key: string;           // identifiant canonique (slug)
  type: 'city' | 'gov';  // ville ou gouvernorat
  canon: string;         // libellé canonique FR (ou ce que tu préfères afficher)
  variants: string[];    // variantes usuelles (FR/AR/EN/IT/RU & translittérations)
};

/** 🇹🇳 VILLES */
const CITY_ALIASES: AliasEntry[] = [
  { key: 'tunis', type: 'city', canon: 'Tunis', variants: ['Tunis', 'Tūnis', 'تونِس', 'تونس', 'Tunes'] },
  { key: 'sousse', type: 'city', canon: 'Sousse', variants: ['Sousse', 'Susa', 'سوسة'] },
  { key: 'sfax', type: 'city', canon: 'Sfax', variants: ['Sfax', 'Ṣfāqis', 'صفاقس', 'Safaqis'] },
  { key: 'mahdia', type: 'city', canon: 'Mahdia', variants: ['Mahdia', 'المهدية', 'Al Mahdia'] },
  { key: 'bizerte', type: 'city', canon: 'Bizerte', variants: ['Bizerte', 'Binzart', 'بنزرت'] },
  { key: 'monastir', type: 'city', canon: 'Monastir', variants: ['Monastir', 'المنستير', 'Al Munastir'] },
  { key: 'nabeul', type: 'city', canon: 'Nabeul', variants: ['Nabeul', 'نابل', 'Nābul'] },
  { key: 'kairouan', type: 'city', canon: 'Kairouan', variants: ['Kairouan', 'القيروان', 'Al Qayrawān'] },
  { key: 'medenine', type: 'city', canon: 'Médenine', variants: ['Médenine', 'Medenine', 'مدنين'] },
  { key: 'gabes', type: 'city', canon: 'Gabès', variants: ['Gabès', 'Gabes', 'قابس'] },
  { key: 'gafsa', type: 'city', canon: 'Gafsa', variants: ['Gafsa', 'قفصة', 'Qafsa'] },
  { key: 'kasserine', type: 'city', canon: 'Kasserine', variants: ['Kasserine', 'القصرين', 'Al Qaṣrayn'] },
  { key: 'sidi-bouzid', type: 'city', canon: 'Sidi Bouzid', variants: ['Sidi Bouzid', 'سيدي بوزيد'] },
  { key: 'tozeur', type: 'city', canon: 'Tozeur', variants: ['Tozeur', 'توزر', 'Tuzar'] },
  { key: 'tatouine', type: 'city', canon: 'Tataouine', variants: ['Tataouine', 'Tatouine', 'تطاوين'] },
  { key: 'kebili', type: 'city', canon: 'Kébili', variants: ['Kébili', 'Kebili', 'قبلي'] },
  { key: 'zaghouan', type: 'city', canon: 'Zaghouan', variants: ['Zaghouan', 'زغوان'] },
  { key: 'siliana', type: 'city', canon: 'Siliana', variants: ['Siliana', 'سليانة'] },
  { key: 'beja', type: 'city', canon: 'Béja', variants: ['Béja', 'Beja', 'باجة'] },
  { key: 'jendouba', type: 'city', canon: 'Jendouba', variants: ['Jendouba', 'جندوبة'] },
  { key: 'kef', type: 'city', canon: 'Le Kef', variants: ['Le Kef', 'الكاف', 'Kef'] },
  { key: 'ariana', type: 'city', canon: 'Ariana', variants: ['Ariana', 'أريانة'] },
  { key: 'ben-arous', type: 'city', canon: 'Ben Arous', variants: ['Ben Arous', 'بن عروس'] },
  { key: 'manouba', type: 'city', canon: 'La Manouba', variants: ['La Manouba', 'منوبة', 'Manouba'] },
];

/** 🇹🇳 GOUVERNORATS (souvent ~ même noms) */
const GOV_ALIASES: AliasEntry[] = [
  { key: 'tunis', type: 'gov', canon: 'Tunis', variants: ['Tunis', 'تونس'] },
  { key: 'sousse', type: 'gov', canon: 'Sousse', variants: ['Sousse', 'سوسة'] },
  { key: 'sfax', type: 'gov', canon: 'Sfax', variants: ['Sfax', 'صفاقس'] },
  { key: 'mahdia', type: 'gov', canon: 'Mahdia', variants: ['Mahdia', 'المهدية'] },
  { key: 'bizerte', type: 'gov', canon: 'Bizerte', variants: ['Bizerte', 'بنزرت'] },
  { key: 'monastir', type: 'gov', canon: 'Monastir', variants: ['Monastir', 'المنستير'] },
  { key: 'nabeul', type: 'gov', canon: 'Nabeul', variants: ['Nabeul', 'نابل'] },
  { key: 'kairouan', type: 'gov', canon: 'Kairouan', variants: ['Kairouan', 'القيروان'] },
  { key: 'medenine', type: 'gov', canon: 'Médenine', variants: ['Médenine', 'Medenine', 'مدنين'] },
  { key: 'gabes', type: 'gov', canon: 'Gabès', variants: ['Gabès', 'Gabes', 'قابس'] },
  { key: 'gafsa', type: 'gov', canon: 'Gafsa', variants: ['Gafsa', 'قفصة'] },
  { key: 'kasserine', type: 'gov', canon: 'Kasserine', variants: ['Kasserine', 'القصرين'] },
  { key: 'sidi-bouzid', type: 'gov', canon: 'Sidi Bouzid', variants: ['Sidi Bouzid', 'سيدي بوزيد'] },
  { key: 'tozeur', type: 'gov', canon: 'Tozeur', variants: ['Tozeur', 'توزر'] },
  { key: 'tatouine', type: 'gov', canon: 'Tataouine', variants: ['Tataouine', 'Tatouine', 'تطاوين'] },
  { key: 'kebili', type: 'gov', canon: 'Kébili', variants: ['Kébili', 'Kebili', 'قبلي'] },
  { key: 'zaghouan', type: 'gov', canon: 'Zaghouan', variants: ['Zaghouan', 'زغوان'] },
  { key: 'siliana', type: 'gov', canon: 'Siliana', variants: ['Siliana', 'سليانة'] },
  { key: 'beja', type: 'gov', canon: 'Béja', variants: ['Béja', 'Beja', 'باجة'] },
  { key: 'jendouba', type: 'gov', canon: 'Jendouba', variants: ['Jendouba', 'جندوبة'] },
  { key: 'kef', type: 'gov', canon: 'Le Kef', variants: ['Le Kef', 'الكاف', 'Kef'] },
  { key: 'ariana', type: 'gov', canon: 'Ariana', variants: ['Ariana', 'أريانة'] },
  { key: 'ben-arous', type: 'gov', canon: 'Ben Arous', variants: ['Ben Arous', 'بن عروس'] },
  { key: 'manouba', type: 'gov', canon: 'La Manouba', variants: ['La Manouba', 'منوبة', 'Manouba'] },
];

export function expandCityVariants(input: string, lang: Lang): string[] {
  const n = geoNorm(input, lang);
  const out = new Set<string>([input]);
  for (const e of CITY_ALIASES) {
    if (e.variants.some(v => geoNorm(v, lang).includes(n) || n.includes(geoNorm(v, lang)))) {
      e.variants.forEach(v => out.add(v));
      out.add(e.canon);
    }
  }
  return Array.from(out);
}

export function expandGovVariants(input: string, lang: Lang): string[] {
  const n = geoNorm(input, lang);
  const out = new Set<string>([input]);
  for (const e of GOV_ALIASES) {
    if (e.variants.some(v => geoNorm(v, lang).includes(n) || n.includes(geoNorm(v, lang)))) {
      e.variants.forEach(v => out.add(v));
      out.add(e.canon);
    }
  }
  return Array.from(out);
}
