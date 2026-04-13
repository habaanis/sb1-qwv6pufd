/*
  # Create Enterprise Suggest RPC Function

  1. RPC Function: enterprise_suggest_simple
    - Fast fuzzy search for entreprise autocomplete
    - Uses normalized columns (nom_norm, ville_norm) for accent-insensitive search
    - Uses pg_trgm similarity for ranking results
    - Supports optional city filtering
  
  2. Search Logic
    - Prioritizes prefix matches (starts with query)
    - Falls back to contains match
    - Uses trigram similarity for ranking
    - Stable alphabetical sorting
  
  3. Parameters
    - q: Search query (name/keyword)
    - p_ville: Optional city filter
    - p_limit: Max results (default 10)
  
  4. Returns
    - id, nom, ville, categories for each match
    - Ordered by relevance
*/

CREATE OR REPLACE FUNCTION public.enterprise_suggest_simple(
  q text, 
  p_ville text DEFAULT NULL, 
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid, 
  nom text, 
  ville text, 
  categories text
)
LANGUAGE sql
STABLE
AS $$
  WITH base AS (
    SELECT 
      e.id, 
      e.nom, 
      e.nom_norm,
      e.ville, 
      e.categories,
      similarity(e.nom_norm, lower(unaccent(q))) as sim
    FROM public.entreprise e
    WHERE
      -- Prefix or contains match on normalized name
      (e.nom_norm LIKE lower(unaccent(q)) || '%'
       OR e.nom_norm LIKE '%' || lower(unaccent(q)) || '%')
      -- Optional city filter
      AND (p_ville IS NULL OR e.ville_norm LIKE lower(unaccent(p_ville)) || '%')
  )
  SELECT 
    base.id, 
    base.nom, 
    base.ville, 
    base.categories
  FROM base
  ORDER BY
    -- 1) Prioritize prefix matches
    CASE WHEN base.nom_norm LIKE lower(unaccent(q)) || '%' THEN 0 ELSE 1 END,
    -- 2) Trigram similarity (higher is better)
    base.sim DESC,
    -- 3) Alphabetical order for stability
    base.nom ASC
  LIMIT p_limit;
$$;