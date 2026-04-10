import { supabase } from '../supabaseClient';

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

interface SearchFilters {
  limit?: number;
  itemType?: string | string[];
  city?: string;
  category?: string;
  orderBy?: string;
  ascending?: boolean;
}

interface SearchStats {
  total: number;
  businesses: number;
  events: number;
  jobs: number;
}

export const searchService = {
  async searchAll(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
    const { limit = 20, city, category } = filters;

    const { data, error } = await supabase.rpc('search_entreprise_smart', {
      p_q: query,
      p_ville: city || null,
      p_categorie: category || null,
      p_scope: null,
      p_limit: limit
    });

    if (error) {
      console.error('[searchService] searchAll error:', error);
      const { data: fallback, error: fallbackErr } = await supabase
        .from('entreprise')
        .select('id, nom, ville, description, telephone, image_url, created_at')
        .or(`nom.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (fallbackErr) throw fallbackErr;

      return (fallback || []).map((e: any) => ({
        id: e.id,
        item_type: 'entreprise',
        title: e.nom || '',
        category_text: '',
        city_text: e.ville || '',
        short_description: e.description,
        phone: e.telephone,
        image_url: e.image_url,
        visibility_status: 'approved',
        created_at: e.created_at,
      }));
    }

    return (data || []).map((e: any) => ({
      id: e.id,
      item_type: 'entreprise',
      title: e.nom || '',
      category_text: e.categorie || '',
      city_text: e.ville || '',
      governorate_fr: e.gouvernorat,
      short_description: e.description,
      phone: e.telephone,
      website: e.site_web,
      image_url: e.image_url,
      visibility_status: 'approved',
      created_at: new Date().toISOString(),
    }));
  },

  async getLocationSuggestions(query: string, _language: string = 'fr'): Promise<any[]> {
    const { data, error } = await supabase.rpc('enterprise_cities_suggest', {
      p_q: query,
      p_limit: 10
    });

    if (error) {
      console.error('[searchService] getLocationSuggestions error:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      label: row.ville,
      value: row.ville,
    }));
  },

  async getCategorySuggestions(query: string): Promise<any[]> {
    const { data, error } = await supabase.rpc('enterprise_categories_suggest', {
      p_q: query,
      p_limit: 12
    });

    if (error) {
      console.error('[searchService] getCategorySuggestions error:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      label: row.categorie,
      value: row.categorie,
    }));
  },

  async getStats(): Promise<SearchStats> {
    const [{ count: businesses }, { count: events }, { count: jobs }] = await Promise.all([
      supabase.from('entreprise').select('*', { count: 'exact', head: true }),
      supabase.from('evenements_locaux').select('*', { count: 'exact', head: true }),
      supabase.from('job_postings').select('*', { count: 'exact', head: true }),
    ]);

    const b = businesses || 0;
    const e = events || 0;
    const j = jobs || 0;

    return {
      total: b + e + j,
      businesses: b,
      events: e,
      jobs: j,
    };
  },

  async getFeaturedEvents(limit: number = 10): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('evenements_locaux')
      .select('id, titre, ville, description, image_url, date_debut, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[searchService] getFeaturedEvents error:', error);
      return [];
    }

    return (data || []).map((e: any) => ({
      id: e.id,
      item_type: 'evenement',
      title: e.titre || '',
      category_text: '',
      city_text: e.ville || '',
      short_description: e.description,
      image_url: e.image_url,
      event_date: e.date_debut,
      visibility_status: 'approved',
      created_at: e.created_at,
    }));
  },
};
