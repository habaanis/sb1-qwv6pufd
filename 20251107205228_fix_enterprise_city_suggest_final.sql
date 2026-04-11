/*
  # Fix RPC enterprise_city_suggest - Version finale
  
  Problème : Conflit entre DISTINCT, ORDER BY et les colonnes SELECT
  Solution : Utiliser une sous-requête avec window function pour le tri
*/

CREATE OR REPLACE FUNCTION enterprise_city_suggest(
  q text,
  p_limit int DEFAULT 8
)
RETURNS TABLE (
  ville text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_cities AS (
    SELECT 
      DISTINCT e.ville,
      CASE 
        WHEN normalize_text(e.ville) ILIKE normalize_text(q) || '%' THEN 1
        WHEN normalize_text(e.ville) ILIKE '%' || normalize_text(q) || '%' THEN 2
        ELSE 3
      END as priority
    FROM entreprise e
    WHERE 
      e.status IN ('active', 'approved')
      AND e.ville IS NOT NULL
      AND e.ville != ''
      AND (
        normalize_text(e.ville) ILIKE '%' || normalize_text(q) || '%'
        OR normalize_text(e.ville) % normalize_text(q)
      )
  )
  SELECT rc.ville
  FROM ranked_cities rc
  ORDER BY rc.priority, rc.ville
  LIMIT p_limit;
END;
$$;
