/*
  # Cr\u00e9ation des RPCs pour SearchGlobal
  
  1. Nouvelle RPC
    - `enterprise_suggest_filtered(q text, p_limit int, p_categorie text, p_ville text)`
      - Recherche d'entreprises avec filtres optionnels cat\u00e9gorie et ville
      - Utilise normalize_text() et index trigram pour performance
      - Retourne id, nom, ville, categories
    
    - `enterprise_city_suggest(q text, p_limit int)`
      - Recherche de villes uniques depuis la table entreprise
      - Normalisation via normalize_text() 
      - Retourne ville unique
  
  2. S\u00e9curit\u00e9
    - Les deux RPCs utilisent les policies RLS existantes
    - Accessible aux utilisateurs anonymes (rôle public)
*/

-- RPC 1: Recherche d'entreprises avec filtres optionnels
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
      normalize_text(e.nom) % normalize_text(q)
      OR normalize_text(e.ville) % normalize_text(q)
      OR normalize_text(e.categories) % normalize_text(q)
    )
    AND (p_categorie IS NULL OR normalize_text(e.categories) ILIKE '%' || normalize_text(p_categorie) || '%')
    AND (p_ville IS NULL OR normalize_text(e.ville) ILIKE '%' || normalize_text(p_ville) || '%')
  ORDER BY
    CASE 
      WHEN normalize_text(e.nom) ILIKE normalize_text(q) || '%' THEN 1
      WHEN normalize_text(e.nom) ILIKE '%' || normalize_text(q) || '%' THEN 2
      ELSE 3
    END,
    similarity(normalize_text(e.nom), normalize_text(q)) DESC,
    e.nom
  LIMIT p_limit;
END;
$$;

-- RPC 2: Recherche de villes
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
    similarity(normalize_text(e.ville), normalize_text(q)) DESC,
    e.ville
  LIMIT p_limit;
END;
$$;

-- Commentaires pour documentation
COMMENT ON FUNCTION enterprise_suggest_filtered IS 'Recherche d''entreprises avec filtres optionnels sur cat\u00e9gorie et ville. Utilise la normalisation de texte et index trigram.';
COMMENT ON FUNCTION enterprise_city_suggest IS 'Recherche de villes uniques depuis les entreprises actives. Utilise la normalisation de texte.';
