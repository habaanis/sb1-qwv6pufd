import { useState, useEffect, useRef, useCallback } from 'react';
import { rpcLog, selectLikeLog } from '../lib/supabaseClient';
import { Tables, RPC } from '../lib/dbTables';

interface EntrepriseItem {
  id: string;
  nom: string;
  ville: string;
  categorie: string;
}

interface VilleItem {
  ville: string;
}

interface UseSuggestResult {
  entreprises: EntrepriseItem[];
  villes: VilleItem[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
}

interface UseSuggestOptions {
  categorie?: string;
  ville?: string;
}

export function useSuggest(options: UseSuggestOptions = {}): UseSuggestResult {
  const [query, setQuery] = useState('');
  const [entreprises, setEntreprises] = useState<EntrepriseItem[]>([]);
  const [villes, setVilles] = useState<VilleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search if query is too short
    if (!q || q.length < 2) {
      setEntreprises([]);
      setVilles([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      // Call both RPCs in parallel
      const [entreprisesResult, villesResult] = await Promise.all([
        // RPC 1: Entreprises filtrées
        rpcLog(RPC.SUGGEST_ENTREPRISES, {
          q: q,
          p_limit: 8,
          p_categorie: options.categorie || null,
          p_ville: options.ville || null
        }, { component: 'useSuggest', scope: 'entreprise' }),
        // RPC 2: Villes
        rpcLog(RPC.SUGGEST_VILLES, {
          q: q,
          p_limit: 8
        }, { component: 'useSuggest', scope: 'ville' })
      ]);

      // Handle entreprises result
      if (entreprisesResult.error) {
        console.warn('RPC enterprise_suggest_filtered failed, using fallback:', entreprisesResult.error.message);

        // Fallback: direct query on nom and catégorie
        const { data: fallbackData, error: fallbackError } = await selectLikeLog<EntrepriseItem>(
          Tables.ENTREPRISE,
          'nom',
          `%${q}%`,
          8,
          { component: 'useSuggest-fallback', scope: 'entreprise' }
        );

        if (fallbackError) {
          throw fallbackError;
        }

        setEntreprises(fallbackData || []);
      } else {
        setEntreprises(entreprisesResult.data || []);
      }

      // Handle villes result
      if (villesResult.error) {
        console.warn('RPC enterprise_city_suggest failed:', villesResult.error.message);
        setVilles([]);
      } else {
        setVilles(villesResult.data || []);
      }

      setError(null);

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching suggestions:', err);
        setError('Erreur lors de la recherche');
        setEntreprises([]);
        setVilles([]);
      }
    } finally {
      setLoading(false);
    }
  }, [options.categorie, options.ville]);

  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset state if query is empty or too short
    if (!query || query.length < 2) {
      setEntreprises([]);
      setVilles([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Set loading state immediately
    setLoading(true);

    // Debounce: wait 200ms before fetching
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, fetchSuggestions]);

  return {
    entreprises,
    villes,
    loading,
    error,
    query,
    setQuery
  };
}
