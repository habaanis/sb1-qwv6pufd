import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useEntrepriseSuggest(q: string) {
  const [cities, setCities] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!q || q.trim().length < 2) {
        setCities([]);
        setCats([]);
        return;
      }

      setLoading(true);
      const [r1, r2] = await Promise.all([
        supabase.rpc('enterprise_cities_suggest', { p_q: q, p_limit: 8 }),
        supabase.rpc('enterprise_categories_suggest', { p_q: q, p_limit: 8 })
      ]);

      if (!alive) return;

      setCities((r1.data ?? []).map((x: any) => x.ville));
      setCats((r2.data ?? []).map((x: any) => x.categorie));
      setLoading(false);
    };

    run();
    return () => {
      alive = false;
    };
  }, [q]);

  return { cities, cats, loading };
}
