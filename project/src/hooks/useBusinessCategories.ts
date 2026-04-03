import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useBusinessCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('entreprise')
        .select('sous_categories')
        .eq('secteur', 'entreprise')
        .not('sous_categories', 'is', null);

      if (queryError) throw queryError;

      const uniqueCategories = [...new Set(
        (data || [])
          .map((item) => item.sous_categories)
          .filter((cat): cat is string => cat !== null && cat !== '')
      )].sort();

      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching business categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  return { categories, loading, error, refetch: fetchCategories };
}
