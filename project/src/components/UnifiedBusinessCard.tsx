import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface UnifiedSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({ 
  placeholder = "Rechercher un établissement, un service...", 
  onSearch 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Recherche directe dans Supabase (sans fonction RPC)
  const searchDirect = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // Requête 1 : Recherche dans la colonne 'nom'
      const { data: nomData, error: nomError } = await supabase
        .from('entreprise')
        .select('id, nom, slug, "catégorie", ville')
        .ilike('nom', `%${searchTerm}%`)
        .limit(10);

      if (nomError) throw nomError;

      // Requête 2 : Recherche dans la colonne 'catégorie'
      const { data: categorieData, error: categorieError } = await supabase
        .from('entreprise')
        .select('id, nom, slug, "catégorie", ville')
        .ilike('"catégorie"', `%${searchTerm}%`)
        .limit(10);

      if (categorieError) throw categorieError;

      // Fusionner les résultats et enlever les doublons
      const allResults = [...(nomData || []), ...(categorieData || [])];
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.id, item])).values()
      );

      // Formater les suggestions
      const formatted = uniqueResults.map(item => ({
        id: item.id,
        name: item.nom,
        slug: item.slug,
        category: item["catégorie"],
        highlight: item.nom
      }));

      setSuggestions(formatted);
      setShowDropdown(formatted.length > 0);
    } catch (err) {
      console.error('❌ Erreur recherche:', err);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce sur la saisie
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchDirect(query);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, searchDirect]);

  // Fermer le dropdown si on clique dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: any) => {
    setQuery(suggestion.name);
    setShowDropdown(false);
    if (suggestion.slug) {
      navigate(`/p/${suggestion.slug}`);
    } else if (suggestion.id) {
      navigate(`/p/${suggestion.id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      if (onSearch) onSearch(query);
      else navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-3 text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          🔍 Rechercher
        </button>
      </form>

      {showDropdown && (
        <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-3 text-center text-gray-500">Chargement...</div>
          )}
          {!loading && suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
            >
              <div className="font-medium text-gray-800">{suggestion.name}</div>
              {suggestion.category && (
                <div className="text-sm text-gray-500">{suggestion.category}</div>
              )}
            </div>
          ))}
          {!loading && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-3 text-center text-gray-500">Aucun résultat</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;
