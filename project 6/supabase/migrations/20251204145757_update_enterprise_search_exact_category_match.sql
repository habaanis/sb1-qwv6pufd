/*
  # Update Enterprise Search - Exact Category Match

  1. Changes
    - Change sous-catégorie filter from ILIKE pattern to exact match
    - This supports the new standardized category values (services_aux_entreprises, etc.)
    - Keep all other functionality unchanged

  2. Parameters (unchanged)
    - p_q: Global text search (nom, description, sous_categories, ville)
    - p_ville: City/Gouvernorat filter (exact or partial match)
    - p_categorie: Sous-catégorie filter (EXACT MATCH on sous_categories)
    - p_limit: Results limit (default 50)
    - p_offset: Pagination offset (default 0)

  3. Notes
    - The sous_categories column should now contain standardized values:
      'services_aux_entreprises', 'transport_logistique', 'btp_construction',
      'industrie', 'communication_marketing', 'informatique_telecom',
      'conseil_formation', 'autre_activite_pro'
    - This migration changes ILIKE pattern matching to exact equality for categories
*/

-- Drop existing function to recreate with exact match logic
DROP FUNCTION IF EXISTS public.enterprise_search_list(text, text, text, int, int);

-- Recreate function with exact category match
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
    -- 🏷️ Filtre sous-catégorie (EXACT MATCH pour valeurs standardisées)
    AND (
      p_categorie IS NULL
      OR p_categorie = ''
      OR e.sous_categories = p_categorie
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
COMMENT ON FUNCTION public.enterprise_search_list IS 'Search and filter enterprises (secteur = entreprise) with exact sous-catégorie matching for standardized category values.';
