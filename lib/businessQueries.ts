/**
 * Helpers pour les requêtes d'entreprises avec tri par note Google
 */

import { supabase } from './supabaseClient';
import { cleanBusinessRatings, sortByRating, getTopRated } from './ratingUtils';

/**
 * Colonnes standard à récupérer pour les entreprises
 */
export const BUSINESS_COLUMNS = `
  id,
  nom,
  adresse,
  ville,
  gouvernorat,
  "catégorie",
  secteur,
  description,
  telephone,
  email,
  site_web,
  "lien facebook",
  "Lien Instagram",
  "Lien TikTok",
  "Lien YouTube",
  logo_url,
  image_url,
  image_couverture,
  horaires_ok,
  "Note Google Globale",
  "Compteur Avis Google",
  "Lien Avis Google",
  "statut Abonnement",
  "niveau priorité abonnement",
  is_premium,
  featured,
  home_featured,
  latitude,
  longitude,
  created_at,
  updated_at
`;

/**
 * Récupère les entreprises avec nettoyage automatique des notes
 */
export async function fetchBusinesses(options: {
  limit?: number;
  secteur?: string;
  categorie?: string;
  ville?: string;
  gouvernorat?: string;
  sortByRating?: boolean;
}) {
  const {
    limit = 100,
    secteur,
    categorie,
    ville,
    gouvernorat,
    sortByRating = false
  } = options;

  let query = supabase
    .from('entreprise')
    .select(BUSINESS_COLUMNS);

  // Filtres
  if (secteur) {
    query = query.contains('secteur', [secteur]);
  }
  if (categorie) {
    query = query.contains('"catégorie"', [categorie]);
  }
  if (ville) {
    query = query.eq('ville', ville);
  }
  if (gouvernorat) {
    query = query.eq('gouvernorat', gouvernorat);
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Erreur fetch entreprises:', error);
    return { data: [], error };
  }

  if (!data) {
    return { data: [], error: null };
  }

  // Nettoyer les notes
  const cleanedData = data.map(cleanBusinessRatings);

  // Trier par note si demandé
  if (sortByRating) {
    return { data: sortByRating(cleanedData), error: null };
  }

  return { data: cleanedData, error: null };
}

/**
 * Récupère le Top N des entreprises par note Google
 */
export async function fetchTopRatedBusinesses(options: {
  limit?: number;
  secteur?: string;
  categorie?: string;
  ville?: string;
  gouvernorat?: string;
}) {
  const {
    limit = 10,
    secteur,
    categorie,
    ville,
    gouvernorat
  } = options;

  // Récupérer plus d'entreprises pour avoir un bon échantillon
  const fetchLimit = Math.max(limit * 10, 100);

  const { data, error } = await fetchBusinesses({
    limit: fetchLimit,
    secteur,
    categorie,
    ville,
    gouvernorat,
    sortByRating: false
  });

  if (error || !data) {
    return { data: [], error };
  }

  // Obtenir le Top N avec notes nettoyées
  const topRated = getTopRated(data, limit);

  return { data: topRated, error: null };
}

/**
 * Récupère une entreprise par ID avec notes nettoyées
 */
export async function fetchBusinessById(id: string) {
  const { data, error } = await supabase
    .from('entreprise')
    .select(BUSINESS_COLUMNS)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erreur fetch entreprise:', error);
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: cleanBusinessRatings(data), error: null };
}

/**
 * Récupère les entreprises featured avec tri par note
 */
export async function fetchFeaturedBusinesses(options: {
  limit?: number;
  type?: 'home' | 'general';
  sortByRating?: boolean;
}) {
  const { limit = 10, type = 'general', sortByRating = true } = options;

  let query = supabase
    .from('entreprise')
    .select(BUSINESS_COLUMNS);

  if (type === 'home') {
    query = query.eq('home_featured', true);
  } else {
    query = query.eq('featured', true);
  }

  query = query.limit(limit * 2); // Récupérer plus pour avoir du choix

  const { data, error } = await query;

  if (error || !data) {
    return { data: [], error };
  }

  const cleanedData = data.map(cleanBusinessRatings);

  if (sortByRating) {
    return { data: sortByRating(cleanedData).slice(0, limit), error: null };
  }

  return { data: cleanedData.slice(0, limit), error: null };
}
