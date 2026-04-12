import { useState, useEffect, useRef } from 'react';
import { searchJobs, JobFilters } from '../lib/jobsApi';

export interface JobPosting {
  id: string;
  titre_poste: string;
  nom_entreprise: string;
  secteur_emploi: string;
  ville: string;
  description_poste: string;
  exigences_profil: string;
  salaire_min?: number | null;
  salaire_max?: number | null;
  email_contact: string;
  telephone_contact: string | null;
  statut: string;
  created_at: string;
  expires_at: string | null;
  competences_cles?: string[];
  niveau_experience?: string;
  type_contrat?: string;
  est_premium?: boolean;
  // Aliases pour compatibilité temporaire
  title?: string;
  company?: string;
  city?: string;
  description?: string;
  description_text?: string;
  requirements?: string;
  salary_range?: string | null;
  contact_email?: string;
  contact_phone?: string | null;
  status?: string;
  skills?: string[];
  seniority?: string;
  contract_type?: string;
}

export interface JobSearchParams {
  q?: string;
  categorie?: string;
  ville?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export function useJobSearch(params: JobSearchParams) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      fetchJobs();
    }, 200);

    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, [params.q, params.categorie, params.ville, params.type, params.offset]);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);

      const filters: JobFilters = {
        q: params.q || null,
        categorie: params.categorie || null,
        ville: params.ville || null,
        type: params.type || null,
        limit: params.limit || 20,
        offset: params.offset || 0
      };

      const data = await searchJobs(filters);
      setJobs(data || []);
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to search jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  return { jobs, loading, error, refetch: fetchJobs };
}
