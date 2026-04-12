/*
  # Update Enterprise Suggest RPC to use categorie

  1. Changes
    - Drop and recreate enterprise_suggest_simple with `categorie` column
    - Reflects the column rename from previous migration
*/

-- Drop the old function first
DROP FUNCTION IF EXISTS public.enterprise_suggest_simple(text, text, integer);

-- Recreate with correct column name
CREATE OR REPLACE FUNCTION public.enterprise_suggest_simple(
  q text, 
  p_ville text DEFAULT NULL, 
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid, 
  nom text, 
  ville text, 
  categorie text
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
      e.categorie,
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
    base.categorie
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