import { supabase } from './supabaseClient';
import { RPC } from './dbTables';

export type JobFilters = {
  q?: string | null;
  categorie?: string | null;
  ville?: string | null;
  type?: string | null;
  limit?: number;
  offset?: number;
};

export type JobFacets = {
  categories: string[];
  villes: string[];
  types: string[];
};

export async function fetchJobFacets(): Promise<JobFacets> {
  const { data, error } = await supabase.rpc(RPC.JOB_FACETS);
  if (error) throw error;

  return {
    categories: (data?.categories || []).filter(Boolean),
    villes: (data?.villes || []).filter(Boolean),
    types: (data?.types || []).filter(Boolean),
  };
}

export async function searchJobs(params: JobFilters) {
  const { q, categorie, ville, type, limit = 20, offset = 0 } = params || {};

  const { data, error } = await supabase.rpc(RPC.JOB_SEARCH, {
    p_q: q?.trim() || '',
    p_categorie: categorie || '',
    p_ville: ville || '',
    p_type: type || '',
    p_limit: limit,
    p_offset: offset,
  });

  if (error) throw error;
  return data || [];
}

export interface JobSearchParams {
  searchTerm?: string;
  gouvernorat?: string;
  secteur?: string;
  contractType?: string;
  companyName?: string;
}

export async function getJobPostingsForSearch(params: JobSearchParams = {}) {
  const { searchTerm, gouvernorat, secteur, companyName } = params;

  try {
    const { data, error } = await supabase.rpc('search_jobs_unaccent', {
      p_search_term: searchTerm?.trim() || '',
      p_gouvernorat: gouvernorat?.trim() || '',
      p_secteur: secteur?.trim() || '',
      p_company_name: companyName?.trim() || ''
    });

    if (error) {
      console.error('Error with search_jobs_unaccent:', error);

      // Fallback: requête simple sans RPC
      const query = supabase
        .from('job_postings')
        .select('*')
        .eq('statut', 'active')
        .order('created_at', { ascending: false });

      if (gouvernorat) query.eq('ville', gouvernorat);
      if (secteur) query.eq('secteur_emploi', secteur);
      if (companyName) query.ilike('nom_entreprise', `%${companyName}%`);
      if (searchTerm) {
        query.or(`titre_poste.ilike.%${searchTerm}%,description_poste.ilike.%${searchTerm}%`);
      }

      const { data: fallbackData, error: fallbackError } = await query.limit(50);

      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching job postings:', err);
    return [];
  }
}
