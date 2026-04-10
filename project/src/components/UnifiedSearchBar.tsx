import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import { buildEntrepriseUrl } from '../lib/url';
import { useLanguage } from '../context/LanguageContext';
import { t, isRTL, type Lang } from '../lib/i18n';
import { normalizeText } from '../lib/textNormalization';
import { generateBusinessUrl } from '../lib/slugify';
import LocationSelectTunisie from './LocationSelectTunisie';
import { Search, Briefcase, Tag, Building2 } from 'lucide-react';

const MIN_CHARS = 2;

interface SearchResult {
  id: string;
  nom?: string;
  ville: string;
  categorie?: string;
  sous_categorie?: string;
  metier?: string;
  _rank?: number;
}

interface SmartSuggestion {
  suggestion: string;
  type: 'secteur' | 'categorie' | 'sous_categorie' | 'entreprise';
  count: number;
  similarity_score: number;
  entreprise_id?: string | null;
}

interface Props {
  className?: string;
  onSearch?: (query: string, city: string) => void;
}

export default function UnifiedSearchBar({ className = '', onSearch }: Props) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const dir = isRTL(language as Lang) ? 'rtl' : 'ltr';

  const [q, setQ] = React.useState('');
  const [city, setCity] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const timer = React.useRef<number | null>(null);
  const cache = React.useRef<Map<string, SmartSuggestion[]>>(new Map());

  const getPlaceholder = () => {
    switch (language) {
      case 'ar':
        return 'ما الذي تبحث عنه؟ (مهنة، خدمة، اسم...)';
      case 'en':
        return 'What are you looking for? (Profession, service, name...)';
      default:
        return 'Que recherchez-vous ? (Métier, service, nom...)';
    }
  };

  const getSmartSuggestions = async (query: string): Promise<SmartSuggestion[]> => {
    const cacheKey = normalizeText(query);

    if (cache.current.has(cacheKey)) {
      return cache.current.get(cacheKey)!;
    }

    try {
      const term = `%${query}%`;

      const [byNom, byCategorie] = await Promise.all([
        supabase
          .from('entreprise')
          .select('id, nom, ville, categorie, sous_categorie')
          .ilike('nom', term)
          .limit(10),
        supabase
          .from('entreprise')
          .select('id, nom, ville, categorie, sous_categorie')
          .ilike('categorie', term)
          .not('categorie', 'is', null)
          .limit(10),
      ]);

      const nomResults = byNom.data || [];
      const categorieResults = byCategorie.data || [];

      const seen = new Set<string>();
      const suggestions: SmartSuggestion[] = [];

      const startTermLower = query.toLowerCase();

      // Entreprises correspondant au nom — ceux qui commencent par le terme en premier
      const sortedByNom = [...nomResults].sort((a, b) => {
        const aStarts = (a.nom || '').toLowerCase().startsWith(startTermLower) ? 0 : 1;
        const bStarts = (b.nom || '').toLowerCase().startsWith(startTermLower) ? 0 : 1;
        return aStarts - bStarts;
      });

      for (const row of sortedByNom) {
        if (!row.nom) continue;
        const key = `entreprise:${row.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push({
          suggestion: row.nom,
          type: 'entreprise',
          count: 1,
          similarity_score: row.nom.toLowerCase().startsWith(startTermLower) ? 1 : 0.5,
          entreprise_id: row.id,
        });
      }

      // Catégories uniques correspondant à la recherche
      const uniqueCategories = new Map<string, number>();
      for (const row of categorieResults) {
        if (!row.categorie) continue;
        uniqueCategories.set(row.categorie, (uniqueCategories.get(row.categorie) || 0) + 1);
      }

      const sortedCategories = [...uniqueCategories.entries()].sort((a, b) => {
        const aStarts = a[0].toLowerCase().startsWith(startTermLower) ? 0 : 1;
        const bStarts = b[0].toLowerCase().startsWith(startTermLower) ? 0 : 1;
        return aStarts - bStarts || b[1] - a[1];
      });

      for (const [categorie, count] of sortedCategories) {
        const key = `categorie:${categorie}`;
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push({
          suggestion: categorie,
          type: 'categorie',
          count,
          similarity_score: categorie.toLowerCase().startsWith(startTermLower) ? 1 : 0.5,
          entreprise_id: null,
        });
      }

      // Limiter à 10 suggestions au total
      const result = suggestions.slice(0, 10);
      cache.current.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error('❌ [Autocomplete] Exception:', err);
      return [];
    }
  };

  const onChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value ?? '';
    setQ(value);

    if (timer.current) window.clearTimeout(timer.current);

    if (value.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    timer.current = window.setTimeout(async () => {
      setLoading(true);
      console.log('⏱️ [Autocomplete] Debounce triggered for:', value.trim());

      try {
        const smartSuggestions = await getSmartSuggestions(value.trim());
        setSuggestions(smartSuggestions);

        // Affiche toujours le dropdown si on a cherché (même 0 résultat)
        setShowDropdown(true);

        console.log(`📋 [Autocomplete] Dropdown SHOWN with ${smartSuggestions.length} suggestions`);
      } catch (err) {
        console.error('❌ [Autocomplete] Suggestion error:', err);
        setSuggestions([]);
        setShowDropdown(true); // Affiche quand même pour montrer "aucun résultat"
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const onSelectSuggestion = (suggestion: SmartSuggestion) => {
    setQ(suggestion.suggestion);
    setShowDropdown(false);

    // Si c'est une entreprise, aller directement vers la fiche
    if (suggestion.type === 'entreprise' && suggestion.entreprise_id) {
      const url = generateBusinessUrl(suggestion.suggestion, suggestion.entreprise_id);
      console.log('🔗 Navigation vers entreprise:', url);
      navigate(url);
      return;
    }

    // Sinon, lancer la recherche dans la liste
    const params = new URLSearchParams();
    params.set('q', suggestion.suggestion);
    if (city.trim()) params.set('ville', city.trim());
    navigate(`/entreprises?${params.toString()}`);

    if (onSearch) {
      onSearch(suggestion.suggestion, city.trim());
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length >= MIN_CHARS) {
      const params = new URLSearchParams();
      params.set('q', q.trim());
      if (city.trim()) params.set('ville', city.trim());
      navigate(`/entreprises?${params.toString()}`);
      setShowDropdown(false);

      if (onSearch) {
        onSearch(q.trim(), city.trim());
      }
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'secteur':
        return <Briefcase className="w-4 h-4 text-[#4A1D43]" />;
      case 'categorie':
        return <Tag className="w-4 h-4 text-[#D4AF37]" />;
      case 'sous_categorie':
        return <Tag className="w-4 h-4 text-gray-500" />;
      case 'entreprise':
        return <Building2 className="w-4 h-4 text-gray-600" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      secteur: { fr: 'Secteur', ar: 'قطاع', en: 'Sector' },
      categorie: { fr: 'Catégorie', ar: 'فئة', en: 'Category' },
      sous_categorie: { fr: 'Sous-catégorie', ar: 'فئة فرعية', en: 'Subcategory' },
      entreprise: { fr: 'Entreprise', ar: 'شركة', en: 'Business' }
    };
    return labels[type]?.[language] || labels[type]?.['fr'] || type;
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`relative w-full z-[10000] ${className}`}
      data-search-bar="unified"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_280px_auto] gap-2.5">
        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A1D43] pointer-events-none" />
            <input
              type="search"
              inputMode="search"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              dir={dir}
              placeholder={getPlaceholder()}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#D4AF37] bg-white text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
              value={q}
              onChange={onChangeQuery}
              onFocus={() => {
                if (q.trim().length >= MIN_CHARS) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
        </div>

        <div className="relative z-10">
          <LocationSelectTunisie
            value={city}
            onChange={setCity}
            placeholder={t(language as Lang, 'search.placeholderCity')}
            className="px-3 py-2 rounded-lg text-sm"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-[#4A1D43] text-white rounded-lg hover:bg-[#5A2D53] transition-colors font-medium text-sm whitespace-nowrap"
        >
          {t(language as Lang, 'search.search')}
        </button>
      </div>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl border border-[#D4AF37] bg-white shadow-xl max-h-[450px] overflow-auto z-[10001]"
          style={{ pointerEvents: 'auto' }}
        >
          <ul className="divide-y divide-gray-100">
            {loading && (
              <li className="py-3 px-4 text-sm text-gray-500 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                {t(language as Lang, 'search.loading')}
              </li>
            )}

            {!loading && suggestions.length === 0 && q.trim().length >= MIN_CHARS && (
              <li className="py-3 px-4 text-sm text-gray-500 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <span>Aucune suggestion trouvée pour "{q}"</span>
                  <span className="text-xs">Essayez un autre terme de recherche</span>
                </div>
              </li>
            )}

            {!loading && suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.suggestion}-${index}`}
                className="py-2.5 px-4 cursor-pointer hover:bg-gradient-to-r hover:from-[#D4AF37]/5 hover:to-transparent transition-all group"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm group-hover:text-[#4A1D43] transition-colors">
                      {suggestion.suggestion}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {getSuggestionTypeLabel(suggestion.type)}
                      </span>
                      {suggestion.count > 1 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-[#D4AF37] font-medium">
                            {suggestion.count} {language === 'fr' ? 'résultats' : language === 'ar' ? 'نتائج' : 'results'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search className="w-4 h-4 text-[#4A1D43]" />
                  </div>
                </div>
              </li>
            ))}

            {!loading && suggestions.length > 0 && (
              <li className="py-2.5 px-4 bg-gradient-to-r from-gray-50 to-transparent">
                <button
                  type="submit"
                  className="w-full text-left text-sm font-medium text-[#4A1D43] hover:text-[#5A2D53] transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{t(language as Lang, 'search.seeAll')} →</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </form>
  );
}
