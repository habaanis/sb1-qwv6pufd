/*
  # Fonction d'autocomplétion intelligente avec fuzzy matching

  1. Nouveautés
    - Fonction RPC `search_smart_autocomplete` pour suggestions en temps réel
    - Utilise pg_trgm pour tolérance aux fautes (distance de Levenshtein)
    - Priorise : Métiers > Catégories > Noms d'entreprises
    - Retourne max 10 suggestions pertinentes
    - Score de similarité pour classement

  2. Logique
    - Recherche fuzzy sur métier, catégorie, sous_categorie, nom
    - Seuil de similarité : 0.3 (30% de correspondance minimum)
    - Tri par : type (métier d'abord) puis score de similarité
*/

-- Fonction d'autocomplétion intelligente
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
  -- 1. Suggestions de métiers (priorité maximale)
  metiers AS (
    SELECT DISTINCT
      metier AS suggestion,
      'metier' AS type,
      COUNT(*) OVER (PARTITION BY metier) AS count,
      GREATEST(
        similarity(LOWER(metier), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(metier))
      ) AS similarity_score
    FROM entreprise
    WHERE
      metier IS NOT NULL
      AND metier != ''
      AND (
        LOWER(metier) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(metier), LOWER(search_query)) > 0.3
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
      sous_categorie AS suggestion,
      'sous_categorie' AS type,
      COUNT(*) OVER (PARTITION BY sous_categorie) AS count,
      GREATEST(
        similarity(LOWER(sous_categorie), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(sous_categorie))
      ) AS similarity_score
    FROM entreprise
    WHERE
      sous_categorie IS NOT NULL
      AND sous_categorie != ''
      AND (
        LOWER(sous_categorie) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(sous_categorie), LOWER(search_query)) > 0.3
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
    SELECT * FROM metiers
    UNION ALL
    SELECT * FROM categories
    UNION ALL
    SELECT * FROM sous_categories
    UNION ALL
    SELECT * FROM entreprises
  )

  -- Tri final : métiers en premier, puis par score de similarité
  SELECT
    suggestion,
    type,
    count,
    similarity_score
  FROM all_suggestions
  ORDER BY
    CASE type
      WHEN 'metier' THEN 1
      WHEN 'categorie' THEN 2
      WHEN 'sous_categorie' THEN 3
      WHEN 'entreprise' THEN 4
    END,
    similarity_score DESC,
    count DESC
  LIMIT 10;
END;
$$;

-- Ajouter un commentaire explicatif
COMMENT ON FUNCTION search_smart_autocomplete IS
'Retourne des suggestions intelligentes avec fuzzy matching et priorisation : Métiers > Catégories > Sous-catégories > Noms entreprises';