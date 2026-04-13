/*
  # Fix RPC enterprise_city_suggest v3
  
  Problème : DISTINCT nécessite que ORDER BY soit dans le SELECT
  Solution : Simplifier avec GROUP BY et inclure le CASE dans SELECT
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
  SELECT 
    e.ville,
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
  GROUP BY e.ville
  ORDER BY
    priority,
    e.ville
  LIMIT p_limit;
END;
$$;
