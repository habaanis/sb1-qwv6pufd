-- Correction de la fonction RPC enterprise_suggest
-- Problème : Colonne niveau_abonnement n'existe pas dans la table entreprise
-- Solution : Utiliser verified à la place pour prioriser les entreprises vérifiées

DROP FUNCTION IF EXISTS enterprise_suggest(text, integer);

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
    -- Priorité aux correspondances exactes au début
    CASE 
      WHEN lower(e.nom) ILIKE lower(q) || '%' THEN 1
      ELSE 2
    END,
    -- Puis par vérification (verified = true en premier)
    CASE WHEN e.verified = true THEN 0 ELSE 1 END,
    -- Puis par nom
    e.nom
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION enterprise_suggest(text, integer) IS 'Recherche d''entreprises avec normalisation. Priorise les entreprises vérifiées. Retourne jusqu''à p_limit résultats.';
