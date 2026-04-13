/*
  # Fix RPC enterprise_city_suggest v2
  
  Probl\u00e8me : L'op\u00e9rateur % (similarit\u00e9) est trop strict pour les villes courtes
  Solution : Utiliser ILIKE pour plus de flexibilit\u00e9
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
  SELECT DISTINCT e.ville
  FROM entreprise e
  WHERE 
    e.status IN ('active', 'approved')
    AND e.ville IS NOT NULL
    AND e.ville != ''
    AND (
      normalize_text(e.ville) ILIKE '%' || normalize_text(q) || '%'
      OR normalize_text(e.ville) % normalize_text(q)
    )
  ORDER BY
    CASE 
      WHEN normalize_text(e.ville) ILIKE normalize_text(q) || '%' THEN 1
      WHEN normalize_text(e.ville) ILIKE '%' || normalize_text(q) || '%' THEN 2
      ELSE 3
    END,
    e.ville
  LIMIT p_limit;
END;
$$;
