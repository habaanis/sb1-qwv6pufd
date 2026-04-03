import { useState, useEffect } from 'react';
import { supabase } from '../lib/BoltDatabase';

interface SearchBarHomeProps {
  language?: string;
  onSearch?: (keyword: string, city: string) => void;
  onNavigateToBusiness?: (id: number) => void;
}

interface BusinessResult {
  id: number;
  nom: string;
  categories?: string;
  sous_categories?: string;
  ville: string;
  adresse?: string;
  telephone?: string;
  site_web?: string;
  email?: string;
  description?: string;
  slug?: string;
}

export default function SearchBarHome({ language = 'fr', onSearch, onNavigateToBusiness }: SearchBarHomeProps) {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const translations = {
    fr: {
      what: '🔍 Que cherchez-vous ?',
      where: '📍 Où êtes-vous ?',
      gps: '📍 Utiliser ma position',
      search: '🔍 Rechercher',
      loading: 'Détection…',
      results: 'Résultats',
      noResults: 'Aucune entreprise trouvée.',
      loadMore: 'Voir plus',
      gpsError: 'Géolocalisation non supportée par votre navigateur.',
      positionError: "Impossible d'obtenir votre position.",
    },
    en: {
      what: '🔍 What are you looking for?',
      where: '📍 Where are you?',
      gps: '📍 Use my location',
      search: '🔍 Search',
      loading: 'Detecting…',
      results: 'Results',
      noResults: 'No companies found.',
      loadMore: 'Load more',
      gpsError: 'Geolocation not supported by your browser.',
      positionError: 'Unable to get your position.',
    },
    ar: {
      what: '🔍 ماذا تبحث؟',
      where: '📍 أين أنت؟',
      gps: '📍 استخدم موقعي',
      search: '🔍 بحث',
      loading: 'جارٍ التحديد…',
      results: 'النتائج',
      noResults: 'لم يتم العثور على شركات.',
      loadMore: 'عرض المزيد',
      gpsError: 'المتصفح لا يدعم تحديد الموقع الجغرافي.',
      positionError: 'تعذر الحصول على موقعك.',
    },
    it: {
      what: '🔍 Cosa stai cercando?',
      where: '📍 Dove ti trovi?',
      gps: '📍 Usa la mia posizione',
      search: '🔍 Cerca',
      loading: 'Rilevamento…',
      results: 'Risultati',
      noResults: 'Nessuna impresa trovata.',
      loadMore: 'Vedi di più',
      gpsError: 'Geolocalizzazione non supportata dal browser.',
      positionError: 'Impossibile ottenere la tua posizione.',
    },
    ru: {
      what: '🔍 Что вы ищете?',
      where: '📍 Где вы находитесь?',
      gps: '📍 Использовать моё местоположение',
      search: '🔍 Поиск',
      loading: 'Определение…',
      results: 'Результаты',
      noResults: 'Компаний не найдено.',
      loadMore: 'Показать ещё',
      gpsError: 'Геолокация не поддерживается вашим браузером.',
      positionError: 'Невозможно получить ваше местоположение.',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.fr;
  const isRTL = language === 'ar';

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleGPS = async () => {
    if (!navigator.geolocation) {
      alert(t.gpsError);
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const { data, error } = await supabase
            .from('cities')
            .select('name_fr, name_ar, name_en, latitude, longitude');

          if (error) throw error;

          let nearestCity: any = null;
          let minDistance = Infinity;

          data?.forEach((cityData: any) => {
            if (cityData.latitude && cityData.longitude) {
              const distance = calculateDistance(
                latitude,
                longitude,
                parseFloat(cityData.latitude),
                parseFloat(cityData.longitude)
              );

              if (distance < minDistance) {
                minDistance = distance;
                nearestCity = cityData;
              }
            }
          });

          if (nearestCity) {
            const cityName =
              language === 'ar'
                ? nearestCity.name_ar
                : language === 'en'
                ? nearestCity.name_en
                : nearestCity.name_fr;
            setCity(cityName || nearestCity.name_fr);
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert(t.positionError);
        setLoading(false);
      }
    );
  };

  const fetchResults = async (currentPage: number, isLoadMore: boolean = false) => {
    if (keyword.trim().length < 1) {
      setResults([]);
      setHasMore(false);
      return;
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setSearching(true);
    }

    try {
      const ITEMS_PER_PAGE = 20;
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      let query = supabase
        .from('entreprise')
        .select('id, nom, categories, sous_categories, ville, adresse, telephone, site_web, email, description', { count: 'exact' })
        .or(`nom.ilike.%${normalizedKeyword}%,categories.ilike.%${normalizedKeyword}%,sous_categories.ilike.%${normalizedKeyword}%,tags.ilike.%${normalizedKeyword}%,description.ilike.%${normalizedKeyword}%`);

      if (city.trim()) {
        query = query.ilike('ville', `%${city}%`);
      }

      const { data, error, count } = await query
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      console.log('🔍 Résultat recherche Supabase :', { keyword, city, normalizedKeyword, data, error, count });

      if (!error && data) {
        if (isLoadMore) {
          setResults(prev => [...prev, ...(data as BusinessResult[])]);
        } else {
          setResults(data as BusinessResult[]);
        }
        setHasMore(count ? (currentPage + 1) * ITEMS_PER_PAGE < count : false);
      } else {
        if (!isLoadMore) setResults([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
      if (!isLoadMore) setResults([]);
      setHasMore(false);
    } finally {
      setSearching(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    const delayDebounceFn = setTimeout(() => {
      fetchResults(0, false);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, city]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage, true);
  };

  const handleResultClick = (result: BusinessResult) => {
    if (onNavigateToBusiness) {
      onNavigateToBusiness(result.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(keyword, city);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
        <div className="relative w-full">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            🔍
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t.what}
            className={`w-full ${
              isRTL ? 'text-right pr-5 pl-12' : 'text-left pl-12 pr-5'
            } py-3 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D62828] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-0`}
          />
        </div>

        <div className="w-full flex items-center gap-2.5">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              📍
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={loading ? t.loading : t.where}
              disabled={loading}
              className={`w-full ${
                isRTL ? 'text-right pr-5 pl-12' : 'text-left pl-12 pr-5'
              } py-3 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D62828] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-0 disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          </div>
          <button
            type="button"
            onClick={handleGPS}
            disabled={loading}
            className={`px-4 py-3 rounded-2xl font-medium text-white text-sm whitespace-nowrap transition-all ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D62828] hover:bg-[#b91c1c] hover:shadow-lg'
            } shadow-[0_4px_20px_rgba(0,0,0,0.04)]`}
          >
            {t.gps}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#D62828] text-white text-base rounded-2xl font-semibold shadow-[0_4px_20px_rgba(214,40,40,0.15)] hover:bg-[#b91c1c] hover:shadow-[0_6px_30px_rgba(214,40,40,0.25)] transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          🔍 {t.search}
        </button>
      </form>

      {searching && (
        <div className="w-full text-center text-gray-500 text-sm">
          {t.loading}
        </div>
      )}

      {results.length > 0 && (
        <div className="w-full mt-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6">
          <h3 className="text-gray-700 font-semibold mb-4 text-lg">{t.results}</h3>
          <ul className="divide-y divide-gray-100">
            {results.map((result) => (
              <li
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="py-4 hover:bg-[#fdf3f3] transition-colors rounded-lg px-4 cursor-pointer"
              >
                <p className="font-medium text-[#D62828] text-lg">{result.nom}</p>
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  {(result.categories || result.sous_categories) && (
                    <p>
                      {result.categories}
                      {result.categories && result.sous_categories && ' / '}
                      {result.sous_categories}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    <span>📍</span>
                    {result.ville}
                    {result.adresse && ` • ${result.adresse}`}
                  </p>
                  {result.telephone && (
                    <p className="flex items-center gap-1">
                      <span>📞</span>
                      {result.telephone}
                    </p>
                  )}
                  {result.site_web && (
                    <a
                      href={result.site_web.startsWith('http') ? result.site_web : `https://${result.site_web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[#D62828] hover:underline"
                    >
                      <span>🌐</span>
                      Site web
                    </a>
                  )}
                </div>
                {result.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{result.description}</p>
                )}
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  loadingMore
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#D62828] text-white hover:bg-[#b91c1c]'
                }`}
              >
                {loadingMore ? t.loading : t.loadMore}
              </button>
            </div>
          )}
        </div>
      )}

      {keyword.length >= 1 && results.length === 0 && !searching && (
        <p className="text-gray-500 text-sm mt-2">{t.noResults}</p>
      )}
    </div>
  );
}
