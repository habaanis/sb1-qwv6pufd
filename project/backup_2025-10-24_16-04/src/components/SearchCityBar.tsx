import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Navigation } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { Language } from '../lib/i18n';

interface City {
  id: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  governorate_id: string;
  governorates?: {
    name_fr: string;
    name_ar: string;
    name_en: string;
  };
}

interface SearchCityBarProps {
  onSelectCity?: (city: City | null) => void;
  language: Language;
  showGeolocationButton?: boolean;
}

const translations = {
  fr: {
    placeholder: 'Dans quelle ville ?',
    governorate: 'Gouvernorat',
    noResults: 'Aucune ville trouvée.',
    clearSearch: 'Effacer la recherche',
    useLocation: '📍 Utiliser ma position',
    gettingLocation: 'Détection...',
    locationError: 'Impossible de récupérer votre position',
    loading: 'Chargement...',
  },
  en: {
    placeholder: 'In which city?',
    governorate: 'Governorate',
    noResults: 'No city found.',
    clearSearch: 'Clear search',
    useLocation: '📍 Use my location',
    gettingLocation: 'Detecting...',
    locationError: 'Unable to get your location',
    loading: 'Loading...',
  },
  ar: {
    placeholder: 'في أي مدينة؟',
    governorate: 'الولاية',
    noResults: 'لم يتم العثور على مدينة.',
    clearSearch: 'مسح البحث',
    useLocation: '📍 استخدم موقعي',
    gettingLocation: 'جارٍ التحديد...',
    locationError: 'تعذر الحصول على موقعك',
    loading: 'جارٍ التحميل...',
  },
  it: {
    placeholder: 'In quale città?',
    governorate: 'Governatorato',
    noResults: 'Nessuna città trovata.',
    clearSearch: 'Cancella ricerca',
    useLocation: '📍 Usa la mia posizione',
    gettingLocation: 'Rilevamento...',
    locationError: 'Impossibile ottenere la tua posizione',
    loading: 'Caricamento...',
  },
  ru: {
    placeholder: 'В каком городе?',
    governorate: 'Губернаторство',
    noResults: 'Город не найден.',
    clearSearch: 'Очистить поиск',
    useLocation: '📍 Использовать моё местоположение',
    gettingLocation: 'Определение...',
    locationError: 'Не удалось получить ваше местоположение',
    loading: 'Загрузка...',
  },
};

export default function SearchCityBar({ onSelectCity, language, showGeolocationButton = false }: SearchCityBarProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (input.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      const nameColumn = `name_${language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr'}`;

      try {
        const { data, error } = await supabase
          .from('cities')
          .select(`
            id,
            name_fr,
            name_ar,
            name_en,
            governorate_id,
            governorates (
              name_fr,
              name_ar,
              name_en
            )
          `)
          .or(`name_fr.ilike.%${input}%,name_ar.ilike.%${input}%,name_en.ilike.%${input}%`)
          .order(nameColumn, { ascending: true })
          .limit(10);

        if (!error && data) {
          setSuggestions(data as City[]);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [input, language]);

  const handleSelect = (city: City) => {
    const cityName = language === 'ar' ? city.name_ar : language === 'en' ? city.name_en : city.name_fr;
    setInput(cityName);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectCity?.(city);
  };

  const handleClear = () => {
    setInput('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectCity?.(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert(t.locationError);
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const { data, error } = await supabase.rpc('find_nearest_city', {
            user_lat: latitude,
            user_lng: longitude,
            max_results: 1
          });

          if (!error && data && data.length > 0) {
            const nearestCity = data[0];
            const cityWithGovernorate = {
              id: nearestCity.id,
              name_fr: nearestCity.name_fr,
              name_ar: nearestCity.name_ar,
              name_en: nearestCity.name_en,
              governorate_id: '',
              governorates: undefined
            };
            handleSelect(cityWithGovernorate as City);
          } else {
            const { data: allCities } = await supabase
              .from('cities')
              .select(`
                id,
                name_fr,
                name_ar,
                name_en,
                governorate_id,
                governorates (
                  name_fr,
                  name_ar,
                  name_en
                )
              `)
              .limit(1);

            if (allCities && allCities.length > 0) {
              handleSelect(allCities[0] as City);
            }
          }
        } catch (error) {
          console.error('Error finding nearest city:', error);
          alert(t.locationError);
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => {
        setIsGettingLocation(false);
        alert(t.locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const getCityName = (city: City) => {
    return language === 'ar' ? city.name_ar : language === 'en' ? city.name_en : city.name_fr;
  };

  const getGovernorateName = (city: City) => {
    if (!city.governorates) return '';
    return language === 'ar'
      ? city.governorates.name_ar
      : language === 'en'
      ? city.governorates.name_en
      : city.governorates.name_fr;
  };

  return (
    <div ref={wrapperRef} className="relative w-full flex items-center gap-3">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => input.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          placeholder={isGettingLocation ? t.gettingLocation : `📍 ${t.placeholder}`}
          disabled={isGettingLocation}
          className={`w-full ${language === 'ar' ? 'pr-6 pl-12 text-right' : 'pl-6 pr-12'} py-4 rounded-3xl bg-white/90 backdrop-blur-sm text-gray-800 text-lg placeholder-gray-500 shadow-[0_2px_15px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#D62828] transition-all ${isGettingLocation ? 'opacity-70' : ''}`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        {input && (
          <button
            onClick={handleClear}
            className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D62828] transition-colors`}
            title={t.clearSearch}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showGeolocationButton && (
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={isGettingLocation}
          className={`px-5 py-4 text-white rounded-3xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${isGettingLocation ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D62828] hover:bg-[#b91c1c]'}`}
          title={t.useLocation}
        >
          {t.useLocation}
        </button>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className={`absolute z-50 ${showGeolocationButton ? 'left-0 right-auto w-full' : 'w-full'} mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 max-h-80 overflow-y-auto animate-fade-in-slide-up top-full`}>
          {suggestions.map((city, index) => (
            <div
              key={city.id}
              onClick={() => handleSelect(city)}
              className={`px-5 py-3 cursor-pointer transition-all border-b border-gray-50 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-[#fdf3f3]'
                  : 'hover:bg-[#fdf3f3]'
              }`}
            >
              <div className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4 text-[#D62828] mt-1 flex-shrink-0" />
                <div className={`flex-1 ${language === 'ar' ? 'text-right' : ''}`}>
                  <span className="font-medium text-gray-900 block">
                    {getCityName(city)}
                  </span>
                  {city.governorates && (
                    <span className="text-sm text-gray-500 block mt-0.5">
                      {t.governorate}: {getGovernorateName(city)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && input.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className={`absolute z-50 ${showGeolocationButton ? 'left-0 right-auto w-full' : 'w-full'} mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 animate-fade-in top-full`}>
          <p className={`text-gray-500 text-center text-sm ${language === 'ar' ? 'text-right' : ''}`}>
            {t.noResults}
          </p>
        </div>
      )}

      {isLoading && isOpen && (
        <div className={`absolute z-50 ${showGeolocationButton ? 'left-0 right-auto w-full' : 'w-full'} mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 animate-fade-in top-full`}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-[#D62828] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 text-sm">{t.loading}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-slide-up {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-slide-up {
          animation: fade-in-slide-up 0.2s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
