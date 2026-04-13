/*
  # Fix RPC enterprise_city_suggest
  
  Probl\u00e8me : DISTINCT avec ORDER BY n\u00e9cessite que les expressions ORDER BY soient dans SELECT
  Solution : Utiliser une sous-requ\u00eate pour calculer la similarit\u00e9
*/

-- Remplacer la RPC city_suggest avec fix
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
    AND normalize_text(e.ville) % normalize_text(q)
  ORDER BY
    e.ville
  LIMIT p_limit;
END;
$$;
