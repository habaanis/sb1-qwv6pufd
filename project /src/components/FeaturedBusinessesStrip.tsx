import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Building2, ShoppingBag, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { ImageWithFallback } from './ImageWithFallback';
import { BusinessCard } from './BusinessCard';
import { getSubscriptionPriority } from '../lib/subscriptionHelper';
import { getFeaturedImageUrl } from '../lib/imagekitUtils';

// 🔤 Variantes acceptées : FR & EN
type RawVariant = 'home' | 'accueil' | 'businesses' | 'entreprises' | 'citizens' | 'citoyens' | 'shops' | 'magasins';
type NormalizedVariant = 'home' | 'businesses' | 'citizens' | 'shops';

interface FeaturedBusinessesStripProps {
  variant: RawVariant;
}

interface BusinessRow {
  id: string;
  nom: string;
  ville: string | null;
  gouvernorat: string | null;
  sous_categories: string | null;
  'statut Abonnement': string | null;
  image_url: string | null;
  logo_url: string | null;
  horaires_ok: string | null;
}

interface BusinessCard {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  imageUrl: string | null;
  logoUrl: string | null;
  isPremium: boolean;
  statutAbonnement: string | null;
  horaires_ok: string | null;
}

// Groupes de catégories
const B2B_CATEGORIES = [
  'Informatique',
  'Développeur web',
  'Agence de communication',
  'Imprimerie',
  'Graphiste',
  'Expert-comptable',
  'Banque',
  'Assurance',
  'Transporteur',
  'Logistique',
  'Centre de formation',
  'Consultant',
  'Architecte',
  'Ingénieur',
];

const DAILY_CATEGORIES = [
  'Médecin',
  'Dentiste',
  'Pharmacie',
  'Kinésithérapeute',
  'Infirmier',
  'Psychologue',
  'Vétérinaire',
  'École',
  'Université',
  'Centre de formation',
  'Coiffeur',
  'Salon de beauté',
  'Esthéticienne',
  'Garage',
  'Mécanicien',
];

const SHOP_CATEGORIES = [
  'Supermarché',
  'Épicerie',
  'Boulangerie',
  'Pâtisserie',
  'Magasin',
  'Boutique',
];

function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// 🔁 Normalisation accueil/entreprises/citoyens/magasins → home/businesses/citizens/shops
function normalizeVariant(variant: RawVariant): NormalizedVariant {
  switch (variant) {
    case 'home':
    case 'accueil':
      return 'home';
    case 'businesses':
    case 'entreprises':
      return 'businesses';
    case 'citizens':
    case 'citoyens':
      return 'citizens';
    case 'shops':
    case 'magasins':
      return 'shops';
    default:
      return 'home';
  }
}

export const FeaturedBusinessesStrip = ({ variant }: FeaturedBusinessesStripProps) => {
  const normalized = normalizeVariant(variant);
  const [businesses, setBusinesses] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('entreprise')
          .select(
            `
            id,
            nom,
            ville,
            gouvernorat,
            "sous-catégories",
            "statut Abonnement",
            image_url,
            logo_url,
            horaires_ok
          `
          )
          .limit(80);

        if (dbError) {
          console.error('[FeaturedBusinessesStrip] Supabase error:', dbError.message);
          if (isMounted) {
            setError('Impossible de charger les établissements pour le moment.');
            setBusinesses([]);
          }
          return;
        }

        const mapped: BusinessCard[] = (data as BusinessRow[] | null || []).map((row) => ({
          id: row.id,
          name: row.nom,
          city: row.gouvernorat || row.ville || '',
          category: Array.isArray(row['sous-catégories']) ? row['sous-catégories'].join(', ') : (row['sous-catégories'] as any || ''),
          description: '',
          imageUrl: row.image_url || null,
          logoUrl: row.logo_url || null,
          isPremium: false,
          statutAbonnement: row['statut Abonnement'] || null,
          horaires_ok: row.horaires_ok || null,
        }));

        if (!isMounted) return;

        // Trier par priorité d'abonnement (Elite > Premium > Artisan > Découverte)
        const sorted = mapped.sort((a, b) => {
          const priorityA = getSubscriptionPriority(a.statutAbonnement);
          const priorityB = getSubscriptionPriority(b.statutAbonnement);
          return priorityB - priorityA;
        });

        const selected = selectByVariant(sorted, normalized);
        setBusinesses(selected);
      } catch (err) {
        console.error('[FeaturedBusinessesStrip] unexpected error:', err);
        if (isMounted) {
          setError('Une erreur est survenue lors du chargement des établissements.');
          setBusinesses([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [normalized]);

  if (loading) {
    return (
      <section className="py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span>Chargement des établissements en avant...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error || businesses.length === 0) {
    return (
      <section className="py-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-gray-500">
            Aucun établissement à afficher pour le moment.
          </p>
        </div>
      </section>
    );
  }

  const { title, subtitle } = getTextsForVariant(normalized);

  // 🎨 1) STYLE PAGE D'ACCUEIL – bandeau horizontal avec couleurs signature
  if (normalized === 'home') {
    return (
      <section className="py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BusinessCard
                  business={{
                    id: business.id,
                    name: business.name,
                    category: business.category,
                    gouvernorat: business.city,
                    statut_abonnement: business.statutAbonnement,
                    imageUrl: business.imageUrl,
                    logoUrl: business.logoUrl,
                    horaires_ok: business.horaires_ok
                  }}
                  onClick={() => {
                    window.location.hash = `#/business/${business.id}`;
                  }}
                  variant="simple"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 🎨 2) STYLE PAGE ENTREPRISES – cartes avec couleurs signature (version compacte)
  if (normalized === 'businesses') {
    return (
      <section className="py-6 bg-white border-y" style={{ borderColor: '#D4AF37', borderWidth: '1px', maxHeight: '500px' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#4A1D43]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[#4A1D43]/70 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {businesses.slice(0, 8).map((business) => (
              <div
                key={business.id}
                onClick={() => {
                  window.location.hash = `#/business/${business.id}`;
                }}
                className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
                style={{ border: '1px solid #D4AF37', maxHeight: '160px' }}
              >
                <div className="w-full h-20 overflow-hidden bg-white p-1 flex items-center justify-center">
                  <img
                    src={getFeaturedImageUrl(business.logoUrl, business.imageUrl)}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
                <div className="p-2">
                  <h3 className="text-xs font-bold text-[#4A1D43] line-clamp-1 mb-1">
                    {business.name}
                  </h3>
                  {business.category && (
                    <p className="text-[10px] text-gray-600 line-clamp-1">
                      {business.category}
                    </p>
                  )}
                  {business.city && (
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {business.city}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 🎨 3) STYLE PAGE CITOYENS – cartes chaleureuses, “proches des gens”
  if (normalized === 'citizens') {
    return (
      <section className="py-10 bg-gradient-to-b from-orange-50/60 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <article
                key={business.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="w-full h-28 overflow-hidden rounded-t-2xl bg-white p-2 flex items-center justify-center">
                  <img
                    src={getFeaturedImageUrl(business.logoUrl, business.imageUrl)}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
                <div className="p-4 flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {business.name}
                    </h3>
                    {business.city && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-orange-700">
                        <MapPin className="w-3 h-3" />
                        {business.city}
                      </span>
                    )}
                  </div>
                  {business.category && (
                    <p className="text-xs text-orange-600">
                      {business.category}
                    </p>
                  )}
                  {business.description && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {business.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 🎨 4) STYLE PAGE MAGASIN – grille “catalogue / shopping”
  if (normalized === 'shops') {
    return (
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {businesses.map((business) => (
              <article
                key={business.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="w-full aspect-[4/3] bg-white overflow-hidden p-2 flex items-center justify-center">
                  <img
                    src={getFeaturedImageUrl(business.logoUrl, business.imageUrl)}
                    alt={business.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-2">
                    {business.name}
                  </h3>
                  {business.city && (
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {business.city}
                    </p>
                  )}
                  {business.category && (
                    <p className="text-[11px] text-orange-700 line-clamp-1">
                      {business.category}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
};

// 🧠 Sélection des établissements selon la page
function selectByVariant(all: BusinessCard[], variant: NormalizedVariant): BusinessCard[] {
  const byNormCat = (b: BusinessCard) => normalize(b.category || '');
  const inGroup = (b: BusinessCard, group: string[]) => {
    const catNorm = byNormCat(b);
    return group.some((g) => catNorm.includes(normalize(g)));
  };

  if (all.length === 0) return [];

  if (variant === 'home') {
    const sorted = [...all].sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      return 0;
    });

    const b2b = sorted.filter((b) => inGroup(b, B2B_CATEGORIES)).slice(0, 2);
    const daily = sorted.filter((b) => inGroup(b, DAILY_CATEGORIES)).slice(0, 2);
    const shops = sorted.filter((b) => inGroup(b, SHOP_CATEGORIES)).slice(0, 2);

    const mixed = [...b2b, ...daily, ...shops];
    const seen = new Set<string>();
    const unique: BusinessCard[] = [];
    for (const b of mixed) {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        unique.push(b);
      }
    }

    if (unique.length > 0) return unique.slice(0, 6);
    return sorted.slice(0, 6);
  }

  if (variant === 'businesses') {
    const filtered = all.filter((b) => inGroup(b, B2B_CATEGORIES));
    return (filtered.length ? filtered : all).slice(0, 12);
  }

  if (variant === 'citizens') {
    const filtered = all.filter((b) => inGroup(b, DAILY_CATEGORIES));
    return (filtered.length ? filtered : all).slice(0, 12);
  }

  if (variant === 'shops') {
    const filtered = all.filter((b) => inGroup(b, SHOP_CATEGORIES));
    return (filtered.length ? filtered : all).slice(0, 12);
  }

  return all.slice(0, 12);
}

// 📝 Titres / sous-titres
function getTextsForVariant(variant: NormalizedVariant) {
  switch (variant) {
    case 'home':
      return {
        title: 'Ils font bouger la Tunisie',
        subtitle:
          'Une sélection dʼentreprises, commerces et services qui illustrent la richesse économique du pays.',
      };
    case 'businesses':
      return {
        title: 'Entreprises qui bougent',
        subtitle:
          'Des prestataires et services B2B pour accompagner les professionnels et les projets.',
      };
    case 'citizens':
      return {
        title: 'Près de chez vous',
        subtitle:
          'Les professionnels et services utiles à votre quotidien, partout en Tunisie.',
      };
    case 'shops':
      return {
        title: 'Commerces & boutiques',
        subtitle:
          'Faites votre shopping en Tunisie : commerces de proximité, artisans et magasins.',
      };
    default:
      return {
        title: 'Établissements mis en avant',
        subtitle: '',
      };
  }
}

export default FeaturedBusinessesStrip;

