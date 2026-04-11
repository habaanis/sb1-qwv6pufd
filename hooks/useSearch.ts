import { useState, useEffect, useCallback, useRef } from 'react';
import { searchService } from '../lib/services/searchService';

interface UseSearchOptions {
  minQueryLength?: number;
  debounceMs?: number;
  limit?: number;
  itemType?: string | string[];
  city?: string;
  category?: string;
  orderBy?: string;
  ascending?: boolean;
  enabled?: boolean;
}

interface SearchResult {
  id: string;
  item_type: string;
  title: string;
  category_text: string;
  city_text: string;
  city_name_fr?: string;
  city_name_ar?: string;
  city_name_en?: string;
  governorate_fr?: string;
  short_description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  event_date?: string;
  event_type?: string;
  visibility_status: string;
  created_at: string;
  updated_at?: string;
}

export const useSearch = (query: string, options: UseSearchOptions = {}) => {
  const {
    minQueryLength = 2,
    debounceMs = 300,
    limit = 20,
    itemType,
    city,
    category,
    orderBy,
    ascending,
    enabled = true
  } = options;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!enabled) return;

    if (!searchQuery || searchQuery.length < minQueryLength) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const filters: any = { limit };

      if (itemType) filters.itemType = itemType;
      if (city) filters.city = city;
      if (category) filters.category = category;
      if (orderBy) filters.orderBy = orderBy;
      if (ascending !== undefined) filters.ascending = ascending;

      const data = await searchService.searchAll(searchQuery, filters);

      if (!abortControllerRef.current?.signal.aborted) {
        setResults(data);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        setError(err.message || 'Erreur de recherche');
        setResults([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, minQueryLength, limit, itemType, city, category, orderBy, ascending]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, performSearch, debounceMs]);

  const refetch = useCallback(() => {
    performSearch(query);
  }, [query, performSearch]);

  return {
    results,
    loading,
    error,
    refetch
  };
};

export const useLocationSuggestions = (query: string, language: string = 'fr') => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchService.getLocationSuggestions(query, language);
        setSuggestions(results);
      } catch (error) {
        console.error('Location suggestions error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, language]);

  return { suggestions, loading };
};

export const useCategorySuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchService.getCategorySuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Category suggestions error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
};

export const useSearchStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    businesses: 0,
    events: 0,
    jobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await searchService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};

export const useFeaturedEvents = (limit: number = 10) => {
  const [events, setEvents] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const data = await searchService.getFeaturedEvents(limit);
        setEvents(data);
      } catch (error) {
        console.error('Featured events error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, [limit]);

  return { events, loading };
};
