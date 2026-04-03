import { useState, useEffect } from 'react';
import { fetchJobFacets, JobFacets } from '../lib/jobsApi';

export function useJobFacets() {
  const [facets, setFacets] = useState<JobFacets>({
    categories: [],
    villes: [],
    types: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFacets() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJobFacets();
        setFacets(data);
      } catch (err) {
        console.error('Error fetching job facets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load filters');
      } finally {
        setLoading(false);
      }
    }

    loadFacets();
  }, []);

  return { facets, loading, error };
}
