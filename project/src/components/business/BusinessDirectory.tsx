import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Building2, MapPin, Tag, Search, Loader, Phone, Globe, Mail, ExternalLink, Star, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/BoltDatabase';
import { withCache } from '../../lib/supabaseCache';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../lib/i18n';
import SignatureCard from '../SignatureCard';
import LazyImage from '../LazyImage';
import {
  mapSubscriptionToTier,
  getTierTextColor,
  getTierSecondaryTextColor,
  getTierLabel,
  isPremiumTier
} from '../../lib/subscriptionTiers';

interface BusinessDirectoryProps {
  mode: 'citizen' | 'partner';
  title?: string;
  subtitle?: string;
}

interface Business {
  id: string;
  nom: string;
  ville: string;
  categories: string;
  sous_categories?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  description?: string;
  verified?: boolean;
  page_categorie?: string;
  is_premium?: boolean;
  statut_abonnement?: string;
}

export default function BusinessDirectory({ mode, title, subtitle }: BusinessDirectoryProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Configuration pagination
  const PAGE_SIZE = 20;
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load businesses with pagination
  const loadBusinesses = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      let query = supabase.from('entreprise').select('*', { count: 'exact' });

      // Filtrage par catégorie
      if (selectedCategory) {
        query = query.ilike('categories', `%${selectedCategory}%`);
      }

      // Filtrage par ville
      if (selectedCity) {
        query = query.ilike('ville', `%${selectedCity}%`);
      }

      // Recherche par mot-clé
      if (searchTerm) {
        const kw = searchTerm.trim();
        query = query.or(`nom.ilike.%${kw}%,description.ilike.%${kw}%,categories.ilike.%${kw}%,sous_categories.ilike.%${kw}%,ville.ilike.%${kw}%`);
      }

      const { data, error: queryError, count } = await query
        .order('nom', { ascending: true })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (queryError) throw queryError;

      if (reset) {
        setBusinesses(data || []);
      } else {
        setBusinesses(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === PAGE_SIZE && (count || 0) > (pageNum + 1) * PAGE_SIZE);
    } catch (err: any) {
      console.error('Error loading businesses:', err);
      setError(err.message || 'Impossible de charger les entreprises');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCity, selectedCategory, searchTerm]);

  // Initial load
  useEffect(() => {
    setPage(0);
    loadBusinesses(0, true);
  }, [loadBusinesses]);

  // Infinite scroll avec Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadBusinesses(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page, loadBusinesses]);

  // Businesses are already filtered server-side
  const filteredBusinesses = businesses;

  const [cities, setCities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Load filter metadata once with cache
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await withCache(
          'entreprise_metadata',
          { fields: 'ville,categories' },
          async () => {
            const { data } = await supabase
              .from('entreprise')
              .select('ville, categories');
            return data;
          },
          15 * 60 * 1000 // Cache 15 minutes
        );

        if (data) {
          const citySet = new Set<string>();
          const catSet = new Set<string>();

          data.forEach((row: any) => {
            if (row.ville) citySet.add(row.ville);
            if (row.categories) {
              row.categories.split(/[,;]/).forEach((cat: string) => {
                const trimmed = cat.trim();
                if (trimmed) catSet.add(trimmed);
              });
            }
          });

          setCities(Array.from(citySet).sort());
          setCategories(Array.from(catSet).sort());
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };

    loadMetadata();
  }, []);

  // Get display texts based on mode
  const displayTitle = title || (mode === 'partner'
    ? t.business?.partnerSearch?.title || 'Rechercher des partenaires'
    : t.business?.directory?.title || 'Annuaire des entreprises');

  const displaySubtitle = subtitle || (mode === 'partner'
    ? t.business?.partnerSearch?.subtitle || 'Trouvez des partenaires, fournisseurs et prestataires'
    : t.business?.directory?.subtitle || 'Découvrez les établissements tunisiens');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl md:text-4xl font-light text-gray-900">
              {displayTitle}
            </h1>
          </div>
          <p className="text-gray-600">
            {displaySubtitle}
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            {mode === 'partner'
              ? t.business?.partnerSearch?.infoBanner || 'Développez votre réseau professionnel en Tunisie'
              : t.business?.directory?.infoBanner || 'Trouvez les services et établissements dont vous avez besoin'}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t.business?.directory?.filters?.title || 'Filtres de recherche'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Recherche texte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.business?.directory?.filters?.search || 'Recherche'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.business?.directory?.filters?.searchPlaceholder || 'Nom, service, catégorie...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Filtre Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.business?.directory?.filters?.city || 'Ville'}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">{t.business?.directory?.filters?.allCities || 'Toutes les villes'}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.business?.directory?.filters?.category || 'Catégorie'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">{t.business?.directory?.filters?.allCategories || 'Toutes les catégories'}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset filters */}
          {(searchTerm || selectedCity || selectedCategory) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('');
                  setSelectedCategory('');
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {t.business?.directory?.filters?.reset || 'Réinitialiser les filtres'}
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredBusinesses.length === 0
              ? t.business?.directory?.noResults || 'Aucun résultat'
              : `${filteredBusinesses.length} ${t.business?.directory?.businessesFound || 'entreprise(s) trouvée(s)'}`}
          </p>
        </div>

        {/* Businesses Grid */}
        {filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {businesses.length === 0
                ? t.business?.directory?.noBusinesses || 'Aucune entreprise pour le moment'
                : t.business?.directory?.noResults || 'Aucun résultat ne correspond à vos critères'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredBusinesses.map((business) => {
              const tier = mapSubscriptionToTier({
                statut_abonnement: business.statut_abonnement,
                is_premium: business.is_premium
              });
              const isPremium = isPremiumTier(tier);
              const tierLabel = getTierLabel(tier, language);
              const textColor = getTierTextColor(tier);
              const secondaryTextColor = getTierSecondaryTextColor(tier);

              return (
                <SignatureCard
                  key={business.id}
                  tier={tier}
                  className="p-6"
                >
                  {/* Badge Tier */}
                  {isPremium && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                      <Star className="w-3 h-3 fill-white" />
                      {tierLabel.toUpperCase()}
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-xl font-bold flex-1 ${textColor}`}>
                        {business.nom}
                      </h3>
                      {business.verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          ✓ Vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span className={secondaryTextColor}>
                          {business.ville}
                        </span>
                      </div>
                      {business.categories && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4 text-[#D4AF37]" />
                          <span className={secondaryTextColor}>
                            {business.categories.split(/[,;]/)[0].trim()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {business.description && (
                    <p className={`text-sm mb-4 line-clamp-2 ${secondaryTextColor}`}>
                      {business.description}
                    </p>
                  )}

                  {/* Categories / Tags */}
                  {business.sous_categories && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {business.sous_categories.split(/[,;]/).slice(0, 3).map((subCat, idx) => (
                          <span
                            key={idx}
                            className={`inline-block px-2 py-1 text-xs rounded ${
                              tier === 'artisan'
                                ? 'bg-[#5A2D53] text-[#D4AF37]'
                                : tier === 'premium'
                                ? 'bg-[#065F46] text-[#D4AF37]'
                                : tier === 'elite'
                                ? 'bg-[#1E1E1E] text-[#D4AF37]'
                                : 'bg-orange-50 text-orange-700'
                            }`}
                          >
                            {subCat.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-3 mb-4 text-sm">
                    {business.telephone && (
                      <a
                        href={`tel:${business.telephone}`}
                        className={`flex items-center gap-1 transition-colors ${secondaryTextColor} hover:text-[#D4AF37]`}
                      >
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        {business.telephone}
                      </a>
                    )}
                    {business.site_web && (
                      <a
                        href={business.site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1 transition-colors ${secondaryTextColor} hover:text-[#D4AF37]`}
                      >
                        <Globe className="w-4 h-4 text-[#D4AF37]" />
                        Site web
                      </a>
                    )}
                    {business.email && (
                      <a
                        href={`mailto:${business.email}`}
                        className={`flex items-center gap-1 transition-colors ${secondaryTextColor} hover:text-[#D4AF37]`}
                      >
                        <Mail className="w-4 h-4 text-[#D4AF37]" />
                        Email
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                      tier === 'artisan'
                        ? 'bg-[#D4AF37] text-[#4A1D43] hover:bg-[#C4A027]'
                        : tier === 'premium'
                        ? 'bg-[#D4AF37] text-[#064E3B] hover:bg-[#C4A027]'
                        : tier === 'elite'
                        ? 'bg-[#D4AF37] text-[#121212] hover:bg-[#C4A027]'
                        : 'text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-gray-900'
                    }`}>
                      {t.business?.directory?.card?.viewDetails || 'Voir la fiche'}
                    </button>
                  </div>
                </SignatureCard>
              );
            })}
          </div>
        )}

        {/* Infinite scroll trigger */}
        {filteredBusinesses.length > 0 && hasMore && (
          <div ref={observerTarget} className="flex justify-center py-8">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-orange-600">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Chargement...</span>
              </div>
            ) : (
              <div className="text-center">
                <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce mx-auto" />
                <p className="text-xs text-gray-500 mt-2">Faites défiler pour voir plus</p>
              </div>
            )}
          </div>
        )}

        {/* End of results indicator */}
        {filteredBusinesses.length > 0 && !hasMore && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Tous les résultats ont été chargés ({filteredBusinesses.length} entreprise{filteredBusinesses.length > 1 ? 's' : ''})
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {mode === 'partner'
              ? t.business?.partnerSearch?.help?.title || 'Comment trouver le bon partenaire ?'
              : t.business?.directory?.help?.title || 'Comment utiliser l\'annuaire ?'}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• {t.business?.directory?.help?.tip1 || 'Utilisez les filtres pour affiner votre recherche'}</li>
            <li>• {t.business?.directory?.help?.tip2 || 'Contactez directement les entreprises par téléphone ou email'}</li>
            <li>• {t.business?.directory?.help?.tip3 || 'Vérifiez les établissements marqués comme "Vérifiés"'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
