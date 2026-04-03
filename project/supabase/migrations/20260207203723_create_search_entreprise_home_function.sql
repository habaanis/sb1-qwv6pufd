/*
  # Fonction de recherche avancée pour la Home Page

  1. Nouvelle Fonction RPC
    - `search_entreprise_home(search_term, gouvernorat_filter, result_limit)`
    - Recherche fuzzy dans nom, sous_categories, badges_entreprise
    - Insensible à la casse avec ILIKE
    - Tri intelligent (nom exact > commence par > contient)
    - Support des tableaux de badges

  2. Caractéristiques
    - Recherche dans 3 colonnes : nom, sous_categories, badges_entreprise
    - Filtre optionnel par gouvernorat
    - Normalisation automatique (trim)
    - Retourne max 15 résultats triés

  3. Sécurité
    - Fonction sécurisée avec SECURITY DEFINER
    - Accessible aux utilisateurs anonymes
*/

-- Fonction de recherche avancée pour entreprises
CREATE OR REPLACE FUNCTION search_entreprise_home(
  search_term TEXT,
  gouvernorat_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  nom TEXT,
  ville TEXT,
  categorie TEXT,
  sous_categories TEXT,
  badges_entreprise TEXT[]
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_term TEXT;
BEGIN
  -- Normalisation du terme de recherche
  normalized_term := TRIM(LOWER(search_term));

  -- Si le terme est trop court, retourner vide
  IF LENGTH(normalized_term) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.nom,
    e.ville,
    e.categorie,
    e.sous_categories,
    e.badges_entreprise
  FROM entreprise e
  WHERE (
    -- Recherche dans le nom
    LOWER(e.nom) ILIKE '%' || normalized_term || '%'

    -- Recherche dans sous_categories
    OR LOWER(e.sous_categories) ILIKE '%' || normalized_term || '%'

    -- Recherche dans badges_entreprise (tableau)
    OR EXISTS (
      SELECT 1
      FROM UNNEST(e.badges_entreprise) AS badge
      WHERE LOWER(badge) ILIKE '%' || normalized_term || '%'
    )
  )
  -- Filtre optionnel par gouvernorat
  AND (
    gouvernorat_filter IS NULL
    OR e.gouvernorat = gouvernorat_filter
  )
  ORDER BY
    -- Priorité 1: Nom exact (insensible à la casse)
    CASE WHEN LOWER(e.nom) = normalized_term THEN 0 ELSE 1 END,

    -- Priorité 2: Nom commence par le terme
    CASE WHEN LOWER(e.nom) LIKE normalized_term || '%' THEN 0 ELSE 1 END,

    -- Priorité 3: Nom contient le terme
    CASE WHEN LOWER(e.nom) ILIKE '%' || normalized_term || '%' THEN 0 ELSE 1 END,

    -- Tri alphabétique final
    e.nom ASC
  LIMIT result_limit;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION search_entreprise_home(TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION search_entreprise_home(TEXT, TEXT, INTEGER) TO authenticated;

-- Commentaire de documentation
COMMENT ON FUNCTION search_entreprise_home IS 'Recherche avancée dans entreprise avec tri intelligent. Cherche dans nom, sous_categories et badges_entreprise.';
