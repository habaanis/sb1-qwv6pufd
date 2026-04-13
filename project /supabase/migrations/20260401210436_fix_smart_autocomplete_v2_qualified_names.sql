/*
  # Correction v2 : Qualification des noms de colonnes

  1. Problème
    - Conflit entre le nom de colonne de sortie 'suggestion' et la colonne interne

  2. Solution
    - Qualification complète : all_suggestions.suggestion
    - Évite l'ambiguïté
*/

DROP FUNCTION IF EXISTS search_smart_autocomplete(text);

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
  secteurs AS (
    SELECT DISTINCT
      secteur AS sugg,
      'secteur'::text AS typ,
      COUNT(*) OVER (PARTITION BY secteur) AS cnt,
      GREATEST(
        similarity(LOWER(secteur), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(secteur))
      )::real AS score
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

  categories AS (
    SELECT DISTINCT
      categorie AS sugg,
      'categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY categorie) AS cnt,
      GREATEST(
        similarity(LOWER(categorie), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(categorie))
      )::real AS score
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

  sous_categories AS (
    SELECT DISTINCT
      sous_categories AS sugg,
      'sous_categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY sous_categories) AS cnt,
      GREATEST(
        similarity(LOWER(sous_categories), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(sous_categories))
      )::real AS score
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

  entreprises AS (
    SELECT DISTINCT
      nom AS sugg,
      'entreprise'::text AS typ,
      1::bigint AS cnt,
      GREATEST(
        similarity(LOWER(nom), LOWER(search_query)),
        word_similarity(LOWER(search_query), LOWER(nom))
      )::real AS score
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

  all_suggestions AS (
    SELECT * FROM secteurs
    UNION ALL
    SELECT * FROM categories
    UNION ALL
    SELECT * FROM sous_categories
    UNION ALL
    SELECT * FROM entreprises
  )

  SELECT
    all_suggestions.sugg AS suggestion,
    all_suggestions.typ AS type,
    all_suggestions.cnt AS count,
    all_suggestions.score AS similarity_score
  FROM all_suggestions
  ORDER BY
    CASE all_suggestions.typ
      WHEN 'secteur' THEN 1
      WHEN 'categorie' THEN 2
      WHEN 'sous_categorie' THEN 3
      WHEN 'entreprise' THEN 4
    END,
    all_suggestions.score DESC,
    all_suggestions.cnt DESC
  LIMIT 10;
END;
$$;