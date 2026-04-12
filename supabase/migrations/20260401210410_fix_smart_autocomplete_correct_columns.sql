/*
  # Correction de la fonction d'autocomplétion avec les VRAIES colonnes

  1. Problème identifié
    - Fonction utilisait `metier`, `sous_categorie` qui n'existent pas
    - Les vraies colonnes sont : `categorie`, `sous_categories`, `secteur`, `mots cles recherche`

  2. Solution
    - Recherche sur : secteur, categorie, sous_categories, nom, mots cles recherche
    - Priorisation : Secteur > Catégorie > Sous-catégories > Noms entreprises
    - Fuzzy matching avec pg_trgm
*/

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS search_smart_autocomplete(text);

-- Créer la nouvelle fonction avec les bonnes colonnes
CREATE OR REPLACE FUNCTION search_smart_autocomplete(search_query text)
RETURNS TABLE (
  suggestion text,
  type text,
  count bigint,
  similarity_score real
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH
  -- 1. Suggestions de secteurs (priorité maximale)
  secteurs AS (
    SELECT DISTINCT
      secteur AS suggestion,
      'secteur' AS type,
      COUNT(*) OVER (PARTITION BY secteur) AS count,
      GREATEST(
        similarity(LOWER(secteur), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(secteur))
      ) AS similarity_score
    FROM entreprise
    WHERE
      secteur IS NOT NULL
      AND secteur != ''
      AND (
        LOWER(secteur) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(secteur), LOWER(search_query)) > 0.3
      )
    LIMIT 5
  ),

  -- 2. Suggestions de catégories
  categories AS (
    SELECT DISTINCT
      categorie AS suggestion,
      'categorie' AS type,
      COUNT(*) OVER (PARTITION BY categorie) AS count,
      GREATEST(
        similarity(LOWER(categorie), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(categorie))
      ) AS similarity_score
    FROM entreprise
    WHERE
      categorie IS NOT NULL
      AND categorie != ''
      AND (
        LOWER(categorie) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(categorie), LOWER(search_query)) > 0.3
      )
    LIMIT 3
  ),

  -- 3. Suggestions de sous-catégories
  sous_categories AS (
    SELECT DISTINCT
      sous_categories AS suggestion,
      'sous_categorie' AS type,
      COUNT(*) OVER (PARTITION BY sous_categories) AS count,
      GREATEST(
        similarity(LOWER(sous_categories), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(sous_categories))
      ) AS similarity_score
    FROM entreprise
    WHERE
      sous_categories IS NOT NULL
      AND sous_categories != ''
      AND (
        LOWER(sous_categories) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(sous_categories), LOWER(search_query)) > 0.3
      )
    LIMIT 2
  ),

  -- 4. Suggestions de noms d'entreprises (priorité basse)
  entreprises AS (
    SELECT DISTINCT
      nom AS suggestion,
      'entreprise' AS type,
      1::bigint AS count,
      GREATEST(
        similarity(LOWER(nom), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(nom))
      ) AS similarity_score
    FROM entreprise
    WHERE
      nom IS NOT NULL
      AND nom != ''
      AND (
        LOWER(nom) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(nom), LOWER(search_query)) > 0.3
      )
    LIMIT 3
  ),

  -- Union de toutes les suggestions
  all_suggestions AS (
    SELECT * FROM secteurs
    UNION ALL
    SELECT * FROM categories
    UNION ALL
    SELECT * FROM sous_categories
    UNION ALL
    SELECT * FROM entreprises
  )

  -- Tri final : secteurs en premier, puis par score de similarité
  SELECT
    suggestion,
    type,
    count,
    similarity_score
  FROM all_suggestions
  ORDER BY
    CASE type
      WHEN 'secteur' THEN 1
      WHEN 'categorie' THEN 2
      WHEN 'sous_categorie' THEN 3
      WHEN 'entreprise' THEN 4
    END,
    similarity_score DESC,
    count DESC
  LIMIT 10;
END;
$$;

COMMENT ON FUNCTION search_smart_autocomplete IS
'Retourne des suggestions intelligentes avec fuzzy matching. Priorisation : Secteur > Catégorie > Sous-catégorie > Nom entreprise';