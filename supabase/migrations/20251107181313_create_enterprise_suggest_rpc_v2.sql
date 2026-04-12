-- Cr\u00e9ation de la fonction RPC enterprise_suggest
-- 
-- Cette fonction permet de rechercher des entreprises avec normalisation automatique
-- pour une recherche flexible et performante.
-- 
-- Param\u00e8tres:
--   - q: La cha\u00eene de recherche (texte)
--   - p_limit: Nombre maximum de r\u00e9sultats (d\u00e9faut: 8)
-- 
-- Retourne: Table de suggestions avec id, nom, ville, categories

-- V\u00e9rifier et activer l'extension unaccent si disponible
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'unaccent'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS unaccent;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Si unaccent n'est pas disponible, on continue sans
    RAISE NOTICE 'Extension unaccent not available, continuing without accent normalization';
END $$;

-- Fonction pour normaliser le texte
CREATE OR REPLACE FUNCTION normalize_text(text_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Essayer d'utiliser unaccent si disponible, sinon juste lower
  BEGIN
    RETURN lower(unaccent(text_input));
  EXCEPTION
    WHEN undefined_function THEN
      RETURN lower(text_input);
  END;
END;
$$;

-- Fonction RPC enterprise_suggest
CREATE OR REPLACE FUNCTION enterprise_suggest(q text, p_limit integer DEFAULT 8)
RETURNS TABLE (
  id uuid,
  nom text,
  ville text,
  categories text
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Recherche avec normalisation
  RETURN QUERY
  SELECT 
    e.id,
    e.nom,
    COALESCE(e.ville, '') as ville,
    COALESCE(e.categories, '') as categories
  FROM entreprise e
  WHERE 
    e.status IN ('active', 'approved')
    AND (
      lower(e.nom) ILIKE lower(q) || '%'
      OR lower(e.nom) ILIKE '%' || lower(q) || '%'
    )
  ORDER BY 
    -- Priorit\u00e9 aux correspondances exactes au d\u00e9but
    CASE 
      WHEN lower(e.nom) ILIKE lower(q) || '%' THEN 1
      ELSE 2
    END,
    -- Puis par niveau d'abonnement
    COALESCE(e.niveau_abonnement, 0) DESC,
    -- Puis par nom
    e.nom
  LIMIT p_limit;
END;
$$;

-- Ajouter un commentaire sur la fonction
COMMENT ON FUNCTION enterprise_suggest(text, integer) IS 'Recherche d''entreprises avec normalisation. Retourne jusqu''à p_limit r\u00e9sultats.';

-- Cr\u00e9er un index pour optimiser la recherche
CREATE INDEX IF NOT EXISTS idx_entreprise_nom_lower 
  ON entreprise (lower(nom)) 
  WHERE status IN ('active', 'approved');