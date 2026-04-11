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
        .select('"sous-catégories"')
        .not('"sous-catégories"', 'is', null);

      if (queryError) throw queryError;

      const allSubCats: string[] = [];
      (data || []).forEach((item: any) => {
        const val = item['sous-catégories'];
        if (Array.isArray(val)) {
          allSubCats.push(...val.filter(Boolean));
        } else if (typeof val === 'string' && val) {
          allSubCats.push(val);
        }
      });

      setCategories([...new Set(allSubCats)].sort());
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
