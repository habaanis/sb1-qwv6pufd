/*
  # Update Enterprise Search List Function

  1. Changes
    - Simplify the function logic
    - Use direct ILIKE filters instead of norm() function
    - Add email and adresse to returned columns
    - Fix table reference (already correct: entreprise)
    - Use existing image_url column directly
    - Improve filtering with OR logic for p_q parameter
    - Better category matching with ILIKE patterns

  2. Parameters
    - p_q: Global text search (nom, description, categorie, sous_categories, ville)
    - p_ville: City filter (exact or partial match)
    - p_categorie: Category filter (exact or partial match)
    - p_limit: Results limit (default 50)
    - p_offset: Pagination offset (default 0)

  3. Security
    - Function accessible to anon and authenticated users
    - RLS policies already in place on entreprise table
*/

-- Drop existing function to recreate with new signature
DROP FUNCTION IF EXISTS public.enterprise_search_list(text, text, text, int, int);

-- Recreate function with improved logic
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
    -- 🔍 Filtre texte global (nom, description, catégorie, sous-catégories, ville)
    (
      p_q IS NULL
      OR p_q = ''
      OR e.nom             ILIKE '%' || p_q || '%'
      OR e.description     ILIKE '%' || p_q || '%'
      OR e.categorie       ILIKE '%' || p_q || '%'
      OR e.sous_categories ILIKE '%' || p_q || '%'
      OR e.ville           ILIKE '%' || p_q || '%'
    )
    -- 🏙️ Filtre ville
    AND (
      p_ville IS NULL
      OR p_ville = ''
      OR e.ville ILIKE p_ville
      OR e.ville ILIKE '%' || p_ville || '%'
    )
    -- 🏷️ Filtre catégorie / sous-catégorie
    AND (
      p_categorie IS NULL
      OR p_categorie = ''
      OR e.categorie       ILIKE p_categorie
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
COMMENT ON FUNCTION public.enterprise_search_list IS 'Search and filter enterprises with text, city, and category filters. Returns paginated results ordered by name.';
