import { useState, useEffect } from 'react';
import { getJobPostingsForSearch, JobSearchParams } from '../lib/jobsApi';

export interface SimpleJobPosting {
  id: string;
  titre_poste: string;
  description_poste: string;
  ville: string;
  secteur_emploi: string;
  type_contrat: string | null;
  created_at: string;
  nom_entreprise: string;
  salaire_min?: number | null;
  salaire_max?: number | null;
  niveau_experience?: string | null;
  competences_cles?: string[] | null;
  est_premium?: boolean | null;
  // Aliases pour compatibilité temporaire
  title?: string;
  description?: string;
  city?: string;
  category?: string;
  contract_type?: string | null;
  company?: string;
  type?: string;
  salary_range?: string | null;
}

export function useSimpleJobSearch(params: JobSearchParams) {
  const [jobs, setJobs] = useState<SimpleJobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching jobs with params:', params);
        const data = await getJobPostingsForSearch(params);

        if (!cancelled) {
          console.log('Jobs fetched:', data?.length || 0);
          setJobs(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error searching jobs:', err);
          setError(err instanceof Error ? err.message : 'Failed to search jobs');
          setJobs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, [params.searchTerm, params.gouvernorat, params.secteur, params.contractType, params.companyName]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getJobPostingsForSearch(params);
      setJobs(data || []);
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to search jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return { jobs, loading, error, refetch };
}
