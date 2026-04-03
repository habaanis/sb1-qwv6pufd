import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Crosshair, HeartPulse, GraduationCap, ShoppingBag, Landmark, PartyPopper, Briefcase, ArrowLeft, Mail, Globe, MapPinIcon, Users } from 'lucide-react';
import LocalMarketplace from './LocalMarketplace';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/BoltDatabase';
import { Jobs } from './Jobs';
import CitizensHealth from './CitizensHealth';
import CitizensServices from './CitizensServices';
import CitizensShops from './CitizensShops';
import SearchBar from '../components/SearchBar';
import { FeaturedBusinessesStrip } from '../components/FeaturedBusinessesStrip';
import { supabase as supabaseClient } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import BannerAdsCarousel from '../components/BannerAdsCarousel';
import { RegistrationForm } from '../components/RegistrationForm';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import StructuredData from '../components/StructuredData';
import { generateCollectionPageSchema } from '../lib/structuredDataSchemas';

interface Suggestion {
  id: string;
  nom: string;
  ville: string;
  categorie: string;
}

async function searchEtablissements(keyword: string, city: string) {
  let query = supabase
    .from('entreprise')
    .select('id, nom, ville, categorie, sous_categories, telephone, site_web, description, email, adresse')
    .in('status', ['active', 'approved'])
    .limit(20);

  if (keyword) {
    query = query.or(`nom.ilike.%${keyword}%, categorie.ilike.%${keyword}%, sous_categories.ilike.%${keyword}%, description.ilike.%${keyword}%`);
  }
  if (city) query = query.eq('gouvernorat', city);

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erreur recherche Supabase:', error.message);
    return [];
  }
  return data || [];
}

async function getSuggestions(keyword: string, city: string = '') {
  if (!keyword || keyword.length < 2) return [];

  let query = supabase
    .from('entreprise')
    .select('id, nom, ville, categorie')
    .in('status', ['active', 'approved'])
    .limit(10);

  if (keyword) {
    query = query.or(`nom.ilike.%${keyword}%, categorie.ilike.%${keyword}%`);
  }
  if (city) {
    query = query.eq('gouvernorat', city);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erreur suggestions:', error.message);
    return [];
  }
  return data || [];
}

async function getCitySuggestions(cityInput: string) {
  if (!cityInput || cityInput.length < 2) return [];

  const { data, error } = await supabase
    .from('entreprise')
    .select('ville')
    .ilike('ville', `%${cityInput}%`)
    .in('status', ['active', 'approved'])
    .limit(10);

  if (error) {
    console.error('❌ Erreur suggestions villes:', error.message);
    return [];
  }

  const uniqueCities = [...new Set(data?.map(d => d.ville).filter(Boolean))];
  return uniqueCities;
}

async function getEtablissementsByCategory(categoryKey: string) {
  const categoryMap: Record<string, string> = {
    'santé': 'Santé',
    'education': 'Éducation',
    'magasins': 'Commerce',
    'administratif': 'Administration',
    'loisirs': 'Loisirs',
  };

  const categoryName = categoryMap[categoryKey];
  if (!categoryName) return [];

  const { data, error } = await supabase
    .from('entreprise')
    .select('id, nom, ville, categorie, sous_categories, telephone, site_web, description, email, adresse')
    .in('status', ['active', 'approved'])
    .ilike('categorie', `%${categoryName}%`)
    .limit(50);

  if (error) {
    console.error('❌ Erreur recherche par catégorie:', error.message);
    return [];
  }
  return data || [];
}

interface CitizensProps {
  onNavigate?: (page: any) => void;
}

export default function Citizens({ onNavigate }: CitizensProps = {}) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const isRTL = language === 'ar';

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryResults, setCategoryResults] = useState<any[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const url = new URL(window.location.href);
  const q = (url.searchParams.get('q') || '').trim();
  const ville = (url.searchParams.get('ville') || '').trim();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const keywordInputRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: 'Santé', key: 'santé', bgImage: getSupabaseImageUrl('sante.jpg'), t: '12%', l: '18%', r: 0, w: 220, h: 180, z: 10 },
    { name: 'Éducation', key: 'education', bgImage: getSupabaseImageUrl('education.jpg'), t: '5%', l: '32%', r: 0, w: 260, h: 210, z: 5 },
    { name: 'Services Citoyens', key: 'administratif', bgImage: getSupabaseImageUrl('administratif.jpg'), t: '7%', l: '55%', r: 0, w: 240, h: 190, z: 8 },
    { name: 'Tourisme & Expat', key: 'social', bgImage: getSupabaseImageUrl('service-social.jpg'), t: '30%', l: '30%', r: 0, w: 300, h: 220, z: 20 },
    { name: 'Commerces & Magasins', key: 'magasins', bgImage: getSupabaseImageUrl('cat_magasin.jpg'), t: '40%', l: '12%', r: 0, w: 230, h: 190, z: 13 },
    { name: 'Loisirs & Événements', key: 'loisirs', bgImage: getSupabaseImageUrl('loisir.jpg'), t: '38%', l: '60%', r: 0, w: 220, h: 180, z: 9 },
  ];

  useEffect(() => {
    if (!q && !ville) return;
    const run = async () => {
      setIsLoading(true);
      let query = supabaseClient
        .from(Tables.ENTREPRISE)
        .select('id, nom, ville, categorie, sous_categories, telephone, site_web, description, email, adresse')
        .order('nom', { ascending: true })
        .limit(60);

      if (q) query = query.ilike('nom', `%${q}%`);
      if (ville) query = query.ilike('ville', `%${ville}%`);

      const { data } = await query;
      setResults(data ?? []);
      setIsLoading(false);
    };
    run();
  }, [q, ville]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (keywordInputRef.current && !keywordInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (keyword.length >= 2) {
        const data = await getSuggestions(keyword, city);
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [keyword, city]);

  useEffect(() => {
    const fetchCitySuggestions = async () => {
      if (city.length >= 2) {
        const cities = await getCitySuggestions(city);
        setCitySuggestions(cities);
        setShowCitySuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
      }
    };

    const timer = setTimeout(fetchCitySuggestions, 300);
    return () => clearTimeout(timer);
  }, [city]);

  const handleSearch = async () => {
    setIsLoading(true);
    setShowSuggestions(false);
    setShowCitySuggestions(false);
    const data = await searchEtablissements(keyword, city);
    setResults(data);
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setKeyword(suggestion.nom);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleCitySuggestionClick = (cityName: string) => {
    setCity(cityName);
    setShowCitySuggestions(false);
  };

  const handleCategoryClick = async (key: string) => {
    if (key === 'emploi') {
      setSelectedCategory('emploi');
    } else if (key === 'santé') {
      setSelectedCategory('santé');
    } else if (key === 'education') {
      onNavigate('education' as any);
    } else if (key === 'localMarketplace') {
      setSelectedCategory('localMarketplace');
    } else if (key === 'administratif') {
      onNavigate('citizensSocial' as any);
    } else if (key === 'social') {
      onNavigate('citizensSocial' as any);
    } else if (key === 'loisirs') {
      onNavigate('citizensLeisure');
    } else if (key === 'magasins') {
      onNavigate('citizensShops' as any);
    } else {
      setIsLoading(true);
      setSelectedCategory(key);
      const data = await getEtablissementsByCategory(key);
      setCategoryResults(data);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setCategoryResults([]);
  };

  if (selectedCategory === 'emploi') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#4A1D43] hover:text-[#D4AF37] transition font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux catégories
            </button>
          </div>
        </div>
        <Jobs />
      </div>
    );
  }

  if (selectedCategory === 'santé') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#4A1D43] hover:text-[#D4AF37] transition font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux catégories
            </button>
          </div>
        </div>
        <CitizensHealth />
      </div>
    );
  }

  if (selectedCategory === 'localMarketplace') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#D62828] hover:text-[#b91c1c] transition font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux catégories
            </button>
          </div>
        </div>
        <LocalMarketplace />
      </div>
    );
  }

  if (selectedCategory === 'social') {
    return <CitizensServices onNavigateBack={handleBack} />;
  }

  if (selectedCategory === 'loisirs') {
    onNavigate('citizensLeisure');
    return null;
  }


  if (selectedCategory && selectedCategory !== 'emploi' && selectedCategory !== 'santé' && selectedCategory !== 'magasins') {
    const currentCategory = categories.find(c => c.key === selectedCategory);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#4A1D43] hover:text-[#D4AF37] transition font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux catégories
          </button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-light text-gray-900 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {currentCategory?.name}
          </motion.h1>
          <p className="text-gray-600 mb-10 max-w-3xl leading-relaxed">
            Découvrez tous les établissements de la catégorie {currentCategory?.name}
          </p>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{t.common.loading}</p>
            </div>
          ) : categoryResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">Aucun établissement trouvé dans cette catégorie.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
              {categoryResults.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.nom}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{item.ville}</span>
                  </div>

                  {item.categorie && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#4A1D43] rounded-full text-xs font-medium border border-[#D4AF37]">
                        {item.categorie}
                      </span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                  )}

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {item.telephone && (
                      <a
                        href={`tel:${item.telephone}`}
                        className="flex items-center gap-2 text-sm text-[#4A1D43] hover:text-[#D4AF37] hover:underline font-medium"
                      >
                        📞 {item.telephone}
                      </a>
                    )}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="flex items-center gap-2 text-sm text-[#4A1D43] hover:text-[#D4AF37] hover:underline font-medium"
                      >
                        <Mail className="w-4 h-4" />
                        {item.email}
                      </a>
                    )}
                    {item.site_web && (
                      <a
                        href={item.site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#4A1D43] hover:text-[#D4AF37] hover:underline font-medium"
                      >
                        <Globe className="w-4 h-4" />
                        Visiter le site
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const citizensItems = [
    { name: 'Services de Santé', url: `${window.location.origin}/#/citizens?category=sante` },
    { name: 'Services Administratifs', url: `${window.location.origin}/#/citizens?category=admin` },
    { name: 'Éducation et Formation', url: `${window.location.origin}/#/citizens?category=education` },
    { name: 'Commerce et Shopping', url: `${window.location.origin}/#/citizens?category=shopping` },
    { name: 'Loisirs et Événements', url: `${window.location.origin}/#/citizens?category=loisirs` },
    { name: 'Services Sociaux', url: `${window.location.origin}/#/citizens?category=social` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 pb-24">
      <StructuredData
        data={generateCollectionPageSchema(
          'Services Citoyens - Dalil Tounes',
          'Découvrez tous les services citoyens en Tunisie : santé, administration, éducation, shopping, loisirs et services sociaux',
          citizensItems
        )}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header avec drapeau tunisien en arrière-plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 rounded-3xl overflow-hidden"
        >
          {/* Drapeau tunisien en arrière-plan */}
          <div className="absolute inset-0 z-0">
            <img
              src={getSupabaseImageUrl('drapeau-tunisie.jpg')}
              alt="Drapeau Tunisie"
              className="w-full h-full object-cover blur-sm opacity-50"
              loading="lazy"
            />
          </div>

          {/* Contenu du header */}
          <div className="relative z-10 flex items-center justify-center gap-6 py-8 px-4">
            <img
              src={getSupabaseImageUrl('ibn-khaldoun.jpg')}
              alt="Ibn Khaldoun"
              className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-full shadow-xl hidden sm:block"
              loading="lazy"
            />
            <div className="text-center">
              <h1
                className="text-4xl md:text-5xl font-light text-gray-900 mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.citizens?.title || 'Citoyens'}
              </h1>
              <p className="text-gray-800 font-medium max-w-2xl mx-auto text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                Trouvez facilement les services et établissements de votre région
              </p>
            </div>
            <img
              src={getSupabaseImageUrl('habib.jpg')}
              alt="Habib Bourguiba"
              className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-full shadow-xl hidden sm:block"
              loading="lazy"
            />
          </div>
        </motion.div>

        {/* Message d'accueil chaleureux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="text-xl md:text-2xl text-gray-700 italic font-light leading-relaxed">
            Parce qu'en Tunisie, l'accueil est une tradition…<br />
            et sur <span className="font-semibold text-[#D62828]">Dalil Tounes</span>, nous voulons que vous vous sentiez comme chez vous ❤️
          </p>
        </motion.div>

        {/* Bannière publicitaire citoyens - Désactivée temporairement */}

        {/* Galerie d'Art - Responsive avec Mosaïque Desktop et Liste Verticale Mobile */}
        <div className="max-w-7xl mx-auto mb-16 px-4 md:px-8">
          {/* Desktop: Mosaïque Absolute, Mobile: Liste Verticale */}
          <div className="relative w-full bg-white md:h-[800px] h-auto flex flex-col md:block gap-3 md:gap-0">
            {categories.map(({ name, key, bgImage, t, l, r, w, h, z }) => {
              return (
                <div
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className="
                    cursor-pointer overflow-hidden rounded-lg border-3 border-[#D4AF37]
                    transition-all duration-500 ease-out
                    md:absolute relative
                    w-[95%] mx-auto md:w-auto h-32 md:h-auto
                  "
                  style={{
                    // Desktop: Coordonnées absolues de la mosaïque
                    top: t,
                    left: l,
                    width: window.innerWidth >= 768 ? `${w}px` : '95%',
                    height: window.innerWidth >= 768 ? `${h}px` : '128px',
                    zIndex: z,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    const isMobile = window.innerWidth < 768;
                    e.currentTarget.style.transform = isMobile ? 'scale(1.05)' : 'scale(1.25)';
                    e.currentTarget.style.zIndex = '999';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(212, 175, 55, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.zIndex = String(z);
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  {bgImage && (
                    <>
                      <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: 'brightness(0.65)' }}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: key === 'education'
                            ? 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)'
                            : 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
                        }}
                      />
                    </>
                  )}
                  <div className={`absolute ${key === 'education' ? 'top-0' : 'bottom-0'} left-0 right-0 p-3 z-10 pointer-events-none`}>
                    <h3
                      className="text-base md:text-lg font-light text-[#D4AF37] text-left leading-tight tracking-wide"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      {name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-[#D4AF37] shadow-sm p-4 mb-16 mx-2.5 md:mx-0">
            <h2 className="text-lg font-medium mb-3 text-gray-900">{t.citizens?.resultsTitle || 'Résultats de recherche'}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {results.map((r) => (
                <div key={r.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition">
                  <h3 className="font-semibold text-gray-900">{r.nom}</h3>
                  <p className="text-sm text-gray-500">{r.ville}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</p>
                  {r.telephone && (
                    <a href={`tel:${r.telephone}`} className="text-[#4A1D43] text-sm hover:underline mt-2 block font-medium">
                      📞 {r.telephone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formulaire d'inscription */}
      {showRegistrationForm && (
        <RegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          selectedPlan="Premium"
        />
      )}
    </div>
  );
}
