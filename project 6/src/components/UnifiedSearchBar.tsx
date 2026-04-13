import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { t, isRTL, type Lang } from '../lib/i18n';
import { generateSlug } from '../lib/slugify';
import LocationSelectTunisie from './LocationSelectTunisie';
import { Search, Building2 } from 'lucide-react';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

interface EntrepriseRow {
  id: string;
  nom: string;
  ville: string | null;
  slug: string | null;
  'catégorie': string[] | null;
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
  const [results, setResults] = React.useState<EntrepriseRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  const getPlaceholder = () => {
    switch (language) {
      case 'ar': return 'ما الذي تبحث عنه؟ (مهنة، خدمة، اسم...)';
      case 'en': return 'What are you looking for? (Profession, service, name...)';
      default: return 'Que recherchez-vous ? (Métier, service, nom...)';
    }
  };

  const fetchSuggestions = async (query: string, ville: string) => {
    setLoading(true);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('enterprise_suggest_filtered', {
        q: query,
        p_limit: 10,
        p_categorie: null,
        p_ville: ville.trim() || null
      });

      if (!rpcError && rpcData) {
        const mapped: EntrepriseRow[] = (rpcData as { id: string; nom: string; ville: string; categorie: string }[]).map(r => ({
          id: r.id,
          nom: r.nom,
          ville: r.ville,
          slug: null,
          'catégorie': r.categorie ? r.categorie.split(', ').filter(Boolean) : null
        }));
        setResults(mapped);
        setShowDropdown(true);
        return;
      }

      let req = supabase
        .from('entreprise')
        .select('id, nom, ville, slug, "catégorie"')
        .or(`nom.ilike.%${query}%`)
        .eq('status', 'approved')
        .limit(10);

      if (ville.trim()) {
        req = req.ilike('ville', `%${ville.trim()}%`);
      }

      const { data, error } = await req;

      if (error) {
        setResults([]);
        return;
      }

      setResults((data as EntrepriseRow[]) || []);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value ?? '';
    setQ(value);

    if (timer.current) window.clearTimeout(timer.current);

    if (value.trim().length < MIN_CHARS) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    timer.current = window.setTimeout(() => {
      fetchSuggestions(value.trim(), city);
    }, DEBOUNCE_MS);
  };

  const goToEntreprise = (row: EntrepriseRow) => {
    setShowDropdown(false);
    const slug = row.slug || generateSlug(row.nom);
    navigate(`/p/${slug}-${row.id}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (q.trim().length >= MIN_CHARS) {
      const params = new URLSearchParams();
      params.set('q', q.trim());
      if (city.trim()) params.set('ville', city.trim());
      navigate(`/entreprises?${params.toString()}`);
      if (onSearch) onSearch(q.trim(), city.trim());
    }
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
                if (q.trim().length >= MIN_CHARS && results.length > 0) setShowDropdown(true);
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
        <div className="absolute left-0 right-0 mt-2 rounded-xl border border-[#D4AF37] bg-white shadow-xl max-h-[400px] overflow-auto z-[10001]">
          <ul className="divide-y divide-gray-100">
            {loading && (
              <li className="py-3 px-4 text-sm text-gray-500 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                {t(language as Lang, 'search.loading')}
              </li>
            )}

            {!loading && results.length === 0 && (
              <li className="py-3 px-4 text-sm text-gray-500 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <span>Aucun résultat pour "{q}"</span>
                </div>
              </li>
            )}

            {!loading && results.map((row) => (
              <li
                key={row.id}
                className="py-2.5 px-4 cursor-pointer hover:bg-[#D4AF37]/5 transition-all group"
                onMouseDown={(e) => { e.preventDefault(); goToEntreprise(row); }}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#4A1D43] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm group-hover:text-[#4A1D43] transition-colors truncate">
                      {row.nom}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      {row.ville && <span>{row.ville}</span>}
                      {row['catégorie']?.[0] && (
                        <>
                          <span>·</span>
                          <span>{row['catégorie'][0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {!loading && results.length > 0 && (
              <li className="py-2.5 px-4 bg-gray-50">
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
