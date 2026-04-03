/* ---------------------------------------------------------
   🌍 UnifiedSearchBar.tsx — Version multilingue Dalil Tounes
   ✅ Stable, élégante et compatible Supabase (table: entreprise)
   --------------------------------------------------------- */

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';

interface SearchResult {
  id: string;
  nom: string;
  ville: string;
  categories: string;
  sous_categories?: string;
  telephone?: string;
  site_web?: string;
}

interface UnifiedSearchBarProps {
  categoryFilter?: string;
  onResultClick?: (result: SearchResult) => void;
}

/* 🗣️ Traductions */
const translations = {
  fr: {
    placeholder: "🔍 Recherchez un établissement, une spécialité ou une ville (ex : Clinique, Mahdia, Médecin...)",
    searching: "Recherche en cours...",
    noResults: "Aucun résultat trouvé pour",
    suggestion: "Essayez avec un autre mot-clé ou une autre ville",
  },
  en: {
    placeholder: "🔍 Search for a business, specialty or city (e.g., Clinic, Mahdia, Doctor...)",
    searching: "Searching...",
    noResults: "No results found for",
    suggestion: "Try another keyword or city",
  },
  ar: {
    placeholder: "🔍 ابحث عن مؤسسة أو اختصاص أو مدينة (مثل: عيادة، المهدية، طبيب...)",
    searching: "جاري البحث...",
    noResults: "لا توجد نتائج لـ",
    suggestion: "حاول بكلمة مفتاحية أو مدينة أخرى",
  },
  it: {
    placeholder: "🔍 Cerca un'attività, una specialità o una città (es: Clinica, Mahdia, Medico...)",
    searching: "Ricerca in corso...",
    noResults: "Nessun risultato trovato per",
    suggestion: "Prova con un'altra parola chiave o città",
  },
  ru: {
    placeholder: "🔍 Найдите компанию, специальность или город (например: Клиника, Махдия, Врач...)",
    searching: "Поиск...",
    noResults: "Результаты не найдены для",
    suggestion: "Попробуйте другой запрос или город",
  },
};

export default function UnifiedSearchBar({ categoryFilter, onResultClick }: UnifiedSearchBarProps) {
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;

  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  /* 🔒 Fermer si clic à l’extérieur */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* 🔍 Requête Supabase instantanée */
  useEffect(() => {
    const searchInstant = async () => {
      if (!keyword || keyword.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      const trimmedKeyword = keyword.trim();

      try {
        let query = supabase
          .from('entreprise')
          .select('id, nom, ville, categories, sous_categories, telephone, site_web')
          .eq('status', 'approved');

        if (categoryFilter) {
          query = query.ilike('categories', `%${categoryFilter}%`);
        }

        // ✅ Correction Supabase OR
        query = query.or(
          `nom.ilike.%${trimmedKeyword}%,ville.ilike.%${trimmedKeyword}%,categories.ilike.%${trimmedKeyword}%,sous_categories.ilike.%${trimmedKeyword}%,description.ilike.%${trimmedKeyword}%`
        );

        const { data, error } = await query.order('nom', { ascending: true }).limit(20);

        if (error) {
          console.error('❌ Erreur recherche:', error.message);
          if (error.message.includes('relation "entreprise" does not exist')) {
            console.warn('⚠️ Table entreprise introuvable.');
          }
          setSuggestions([]);
        } else {
          setSuggestions(data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('🚨 Erreur inattendue:', err);
        setSuggestions([]);
      }

      setIsLoading(false);
    };

    const debounceTimer = setTimeout(searchInstant, 300);
    return () => clearTimeout(debounceTimer);
  }, [keyword, categoryFilter]);

  /* 🧭 Cliquer sur un résultat */
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) onResultClick(result);
    else alert(`${result.nom}\n(Fiche détaillée à venir)`);
    setShowSuggestions(false);
    setKeyword('');
  };

  const clearSearch = () => {
    setKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  /* 🧩 Interface */
  return (
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto">
      {/* Champ principal */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t.placeholder}
          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-800 shadow-sm"
        />
        {keyword && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Résultats */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">{t.searching}</div>
            ) : suggestions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {suggestions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleResultClick(r)}
                    className="w-full px-5 py-4 text-left hover:bg-orange-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {r.nom}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                          <span>📍 {r.ville}</span>
                          <span className="text-gray-400">•</span>
                          <span>{r.categories}</span>
                          {r.sous_categories && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{r.sous_categories}</span>
                            </>
                          )}
                        </div>
                        {r.telephone && (
                          <div className="mt-1 text-sm text-gray-500">📞 {r.telephone}</div>
                        )}
                      </div>
                      <div className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {t.noResults} <strong>“{keyword}”</strong>
                <p className="text-sm text-gray-400 mt-2">{t.suggestion}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
