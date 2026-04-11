/*
  # Fix RPC enterprise_suggest_filtered
  
  Problème : L'opérateur % (trigram) est trop strict pour les requêtes courtes
  Solution : Privilégier ILIKE sur le texte normalisé sans dépendre du trigram
*/

CREATE OR REPLACE FUNCTION enterprise_suggest_filtered(
  q text,
  p_limit int DEFAULT 8,
  p_categorie text DEFAULT NULL,
  p_ville text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  nom text,
  ville text,
  categories text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nom,
    e.ville,
    e.categories
  FROM entreprise e
  WHERE 
    e.status IN ('active', 'approved')
    AND (
      normalize_text(e.nom) ILIKE '%' || normalize_text(q) || '%'
      OR normalize_text(e.ville) ILIKE '%' || normalize_text(q) || '%'
      OR normalize_text(e.categories) ILIKE '%' || normalize_text(q) || '%'
    )
    AND (p_categorie IS NULL OR normalize_text(e.categories) ILIKE '%' || normalize_text(p_categorie) || '%')
    AND (p_ville IS NULL OR normalize_text(e.ville) ILIKE '%' || normalize_text(p_ville) || '%')
  ORDER BY
    CASE 
      WHEN normalize_text(e.nom) ILIKE normalize_text(q) || '%' THEN 1
      WHEN normalize_text(e.ville) ILIKE normalize_text(q) || '%' THEN 2
      WHEN normalize_text(e.nom) ILIKE '%' || normalize_text(q) || '%' THEN 3
      ELSE 4
    END,
    e.nom
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION enterprise_suggest_filtered IS 'Recherche d''entreprises avec filtres optionnels - Version optimisée avec ILIKE';
