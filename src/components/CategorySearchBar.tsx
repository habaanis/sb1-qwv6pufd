import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

interface CategorySearchBarProps {
  listePageValue?: string;
  placeholder?: string;
  onSearch?: (query: string, ville: string) => void;
  onSelectBusiness?: (businessId: string) => void;
  onClear?: () => void;
}

interface Suggestion {
  id: string;
  nom: string;
  ville?: string;
  categorie?: string;
}

interface DropdownRect {
  top: number;
  left: number;
  width: number;
}

export default function CategorySearchBar({
  listePageValue,
  placeholder = 'Rechercher...',
  onSearch,
  onSelectBusiness,
  onClear
}: CategorySearchBarProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [ville, setVille] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [villeSuggestions, setVilleSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showVilleSuggestions, setShowVilleSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queryDropdownRect, setQueryDropdownRect] = useState<DropdownRect | null>(null);
  const [villeDropdownRect, setVilleDropdownRect] = useState<DropdownRect | null>(null);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const villeInputRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);
  const villeRef = useRef<HTMLDivElement>(null);

  const updateQueryRect = () => {
    if (queryInputRef.current) {
      const rect = queryInputRef.current.getBoundingClientRect();
      setQueryDropdownRect({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const updateVilleRect = () => {
    if (villeInputRef.current) {
      const rect = villeInputRef.current.getBoundingClientRect();
      setVilleDropdownRect({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (queryRef.current && !queryRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (villeRef.current && !villeRef.current.contains(e.target as Node)) {
        setShowVilleSuggestions(false);
      }
    };
    const handleScrollResize = () => {
      updateQueryRect();
      updateVilleRect();
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ville.length >= 2) {
        fetchVilleSuggestions();
      } else {
        setVilleSuggestions([]);
        setShowVilleSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [ville]);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase.rpc('search_entreprise_smart', {
        p_q: query,
        p_ville: ville && ville.trim().length > 0 ? ville : null,
        p_categorie: null,
        p_scope: listePageValue ? listePageValue : null,
        p_limit: 8
      });

      if (!error && data) {
        const mapped: Suggestion[] = (data as any[]).map((row) => ({
          id: row.id,
          nom: row.nom,
          ville: row.ville,
          categorie: row.categorie,
        }));
        setSuggestions(mapped);
        setShowSuggestions(true);
        updateQueryRect();
      }
    } catch (err) {
      console.error('Erreur suggestions:', err);
    }
  };

  const fetchVilleSuggestions = async () => {
    try {
      const { data, error } = await supabase.rpc('enterprise_cities_suggest', {
        p_q: ville,
        p_limit: 10
      });
      if (!error && data) {
        const uniqueVilles = (data as any[]).map((d) => d.ville).filter(Boolean);
        setVilleSuggestions(uniqueVilles);
        setShowVilleSuggestions(true);
        updateVilleRect();
      }
    } catch (err) {
      console.error('Erreur suggestions villes:', err);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, ville);
    }
    setShowSuggestions(false);
    setShowVilleSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.nom);
    setShowSuggestions(false);
    if (onSelectBusiness) {
      onSelectBusiness(suggestion.id);
    } else if (onSearch) {
      onSearch(suggestion.nom, ville);
    }
  };

  const handleVilleSuggestionClick = (v: string) => {
    setVille(v);
    setShowVilleSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border-2 border-[#D4AF37] p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative" ref={queryRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={queryInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  if (query.length >= 2) {
                    setShowSuggestions(true);
                    updateQueryRect();
                  }
                }}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setVille('');
                    setSuggestions([]);
                    if (onClear) {
                      onClear();
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Effacer la recherche"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:w-64 relative" ref={villeRef}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={villeInputRef}
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  if (ville.length >= 2) {
                    setShowVilleSuggestions(true);
                    updateVilleRect();
                  }
                }}
                placeholder={language === 'fr' ? 'Ville / Gouvernorat' : language === 'ar' ? 'المدينة / الولاية' : 'City / Governorate'}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
              {ville && (
                <button
                  onClick={() => {
                    setVille('');
                    setVilleSuggestions([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-[#4A1D43] hover:bg-[#5A2D53] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {language === 'fr' ? 'Recherche...' : language === 'ar' ? 'جاري البحث...' : 'Searching...'}
              </span>
            ) : (
              language === 'fr' ? 'Rechercher' : language === 'ar' ? 'بحث' : 'Search'
            )}
          </button>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && queryDropdownRect && (
        <div
          style={{
            position: 'fixed',
            top: queryDropdownRect.top,
            left: queryDropdownRect.left,
            width: queryDropdownRect.width,
            zIndex: 99999,
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="font-medium text-gray-900">{suggestion.nom}</div>
            </button>
          ))}
        </div>
      )}

      {showVilleSuggestions && villeSuggestions.length > 0 && villeDropdownRect && (
        <div
          style={{
            position: 'fixed',
            top: villeDropdownRect.top,
            left: villeDropdownRect.left,
            width: villeDropdownRect.width,
            zIndex: 99999,
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {villeSuggestions.map((v, idx) => (
            <button
              key={idx}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleVilleSuggestionClick(v)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
            >
              <span className="text-gray-700">{v}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
