import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Crosshair, HeartPulse, GraduationCap, ShoppingBag, Landmark, PartyPopper, Briefcase, ArrowLeft, Mail, Globe, MapPinIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/BoltDatabase';
import { Jobs } from './Jobs';
import CitizensHealth from './CitizensHealth';

interface Suggestion {
  id: string;
  nom: string;
  ville: string;
  categories: string;
}

async function searchEtablissements(keyword: string, city: string) {
  let query = supabase
    .from('entreprise')
    .select('id, nom, ville, categories, sous_categories, telephone, site_web, description, email, adresse')
    .in('status', ['active', 'approved'])
    .limit(20);

  if (keyword) {
    query = query.or(`nom.ilike.%${keyword}%, categories.ilike.%${keyword}%, sous_categories.ilike.%${keyword}%, description.ilike.%${keyword}%`);
  }
  if (city) query = query.ilike('ville', `%${city}%`);

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
    .select('id, nom, ville, categories')
    .in('status', ['active', 'approved'])
    .limit(10);

  if (keyword) {
    query = query.or(`nom.ilike.%${keyword}%, categories.ilike.%${keyword}%`);
  }
  if (city) {
    query = query.ilike('ville', `%${city}%`);
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
    .select('id, nom, ville, categories, sous_categories, telephone, site_web, description, email, adresse')
    .in('status', ['active', 'approved'])
    .ilike('categories', `%${categoryName}%`)
    .limit(50);

  if (error) {
    console.error('❌ Erreur recherche par catégorie:', error.message);
    return [];
  }
  return data || [];
}

export default function Citizens() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const isRTL = language === 'ar';

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryResults, setCategoryResults] = useState<any[]>([]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const keywordInputRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLDivElement>(null);

  const categories = [
    { icon: HeartPulse, name: t.citizens.categories.health, color: 'from-red-50 to-red-100', key: 'santé' },
    { icon: GraduationCap, name: t.citizens.categories.education, color: 'from-blue-50 to-blue-100', key: 'education' },
    { icon: ShoppingBag, name: t.citizens.categories.shops, color: 'from-green-50 to-green-100', key: 'magasins' },
    { icon: Landmark, name: t.citizens.categories.administration, color: 'from-yellow-50 to-yellow-100', key: 'administratif' },
    { icon: PartyPopper, name: t.citizens.categories.leisure, color: 'from-purple-50 to-purple-100', key: 'loisirs' },
    { icon: Briefcase, name: t.citizens.categories.jobs, color: 'from-orange-50 to-orange-100', key: 'emploi' },
  ];

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
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition font-medium"
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
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium"
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

  if (selectedCategory && selectedCategory !== 'emploi' && selectedCategory !== 'santé') {
    const currentCategory = categories.find(c => c.key === selectedCategory);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition font-medium mb-8"
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
              <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{t.common.loading}</p>
            </div>
          ) : categoryResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">Aucun établissement trouvé dans cette catégorie.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  {item.categories && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {item.categories}
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
                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        📞 {item.telephone}
                      </a>
                    )}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline"
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
                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-light text-gray-900 mb-6 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t.citizens.title}
        </motion.h1>
        <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t.citizens.subtitle}
        </p>

        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-4 mb-10">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="relative flex-1" ref={keywordInputRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => keyword.length >= 2 && setShowSuggestions(true)}
                placeholder={t.citizens.search.placeholderKeyword}
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-gray-800"
              />

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{suggestion.nom}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <MapPinIcon className="w-3 h-3" />
                          {suggestion.ville} • {suggestion.categories}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative md:w-64" ref={cityInputRef}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={() => city.length >= 2 && setShowCitySuggestions(true)}
                placeholder={t.citizens.search.placeholderCity}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-gray-800"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Crosshair className="text-orange-500 w-5 h-5" />
              </button>

              <AnimatePresence>
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    {citySuggestions.map((cityName, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCitySuggestionClick(cityName)}
                        className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                      >
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{cityName}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleSearch}
              className="bg-orange-600 text-white rounded-lg px-6 py-3 hover:bg-orange-700 transition font-medium shadow-sm"
            >
              {isLoading ? t.common.loading : t.citizens.search.button}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-10">
            <h2 className="text-lg font-medium mb-3 text-gray-900">{t.citizens.resultsTitle}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r) => (
                <div key={r.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition">
                  <h3 className="font-semibold text-gray-900">{r.nom}</h3>
                  <p className="text-sm text-gray-500">{r.ville}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</p>
                  {r.telephone && (
                    <a href={`tel:${r.telephone}`} className="text-orange-600 text-sm hover:underline mt-2 block">
                      📞 {r.telephone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {categories.map(({ icon: Icon, name, color, key }, idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-center cursor-pointer border border-gray-100 hover:shadow-md transition-all`}
              onClick={() => handleCategoryClick(key)}
            >
              <Icon className="w-8 h-8 mx-auto mb-3 text-orange-600" />
              <h3 className="text-lg font-medium text-gray-800">{name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
