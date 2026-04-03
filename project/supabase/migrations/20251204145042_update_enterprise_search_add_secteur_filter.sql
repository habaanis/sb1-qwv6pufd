/*
  # Update Enterprise Search List Function - Add Secteur Filter

  1. Changes
    - Add filter for secteur = 'entreprise' to restrict results to business sector
    - Keep all existing parameters and functionality
    - Improve ville/gouvernorat filtering

  2. Parameters
    - p_q: Global text search (nom, description, sous_categories, ville)
    - p_ville: City/Gouvernorat filter (exact or partial match)
    - p_categorie: Sous-catégorie filter (exact or partial match on sous_categories)
    - p_limit: Results limit (default 50)
    - p_offset: Pagination offset (default 0)

  3. Security
    - Function accessible to anon and authenticated users
    - RLS policies apply automatically on entreprise table
*/

-- Drop existing function to recreate with new logic
DROP FUNCTION IF EXISTS public.enterprise_search_list(text, text, text, int, int);

-- Recreate function with secteur filter
CREATE OR REPLACE FUNCTION public.enterprise_search_list(
  p_q         text    DEFAULT NULL,
  p_ville     text    DEFAULT NULL,
  p_categorie text    DEFAULT NULL,
  p_limit     integer DEFAULT 50,
  p_offset    integer DEFAULT 0
)
RETURNS TABLE (
  id              uuid,
  nom             text,
  categorie       text,
  sous_categories text,
  ville           text,
  adresse         text,
  telephone       text,
  email           text,
  site_web        text,
  description     text,
  image_url       text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id,
    e.nom,
    e.categorie,
    e.sous_categories,
    e.ville,
    e.adresse,
    e.telephone,
    e.email,
    e.site_web,
    e.description,
    e.image_url
  FROM
    entreprise e
  WHERE
    -- 🏢 Filtre SECTEUR : uniquement les entreprises (secteur = 'entreprise')
    (e.secteur = 'entreprise' OR e.secteur IS NULL)
    -- 🔍 Filtre texte global (nom, description, sous-catégories, ville)
    AND (
      p_q IS NULL
      OR p_q = ''
      OR e.nom             ILIKE '%' || p_q || '%'
      OR e.description     ILIKE '%' || p_q || '%'
      OR e.sous_categories ILIKE '%' || p_q || '%'
      OR e.ville           ILIKE '%' || p_q || '%'
    )
    -- 🏙️ Filtre ville/gouvernorat
    AND (
      p_ville IS NULL
      OR p_ville = ''
      OR e.ville ILIKE p_ville
      OR e.ville ILIKE '%' || p_ville || '%'
    )
    -- 🏷️ Filtre sous-catégorie
    AND (
      p_categorie IS NULL
      OR p_categorie = ''
      OR e.sous_categories ILIKE '%' || p_categorie || '%'
    )
  ORDER BY
    e.nom ASC
  LIMIT
    p_limit
  OFFSET
    p_offset;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.enterprise_search_list(text, text, text, integer, integer) TO anon, authenticated;

-- Add comment
COMMENT ON FUNCTION public.enterprise_search_list IS 'Search and filter enterprises (secteur = entreprise) with text, city/gouvernorat, and sous-catégorie filters. Returns paginated results ordered by name.';
