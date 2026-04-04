/*
  # Correction CRITIQUE : search_smart_autocomplete avec ID en TEXT
  
  1. Problème identifié
    - La table entreprise a id de type TEXT, pas UUID
    - La fonction RPC retournait uuid, ce qui causait une erreur UNION
    - Résultat : AUCUN résultat de recherche n'était retourné
  
  2. Solution
    - Changer le type de retour entreprise_id de uuid à text
    - Changer NULL::uuid en NULL::text dans toutes les CTEs
    - Ajuster la signature de la fonction
*/

DROP FUNCTION IF EXISTS search_smart_autocomplete(text);

CREATE OR REPLACE FUNCTION search_smart_autocomplete(search_query text)
RETURNS TABLE (
  suggestion text,
  type text,
  count bigint,
  similarity_score real,
  entreprise_id text
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
        similarity(LOWER(unaccent(secteur)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(secteur))),
        similarity(LOWER(secteur), LOWER(search_query))
      )::real AS score,
      NULL::text AS eid
    FROM entreprise
    WHERE
      secteur IS NOT NULL
      AND secteur != ''
      AND (
        LOWER(unaccent(secteur)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(secteur) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(secteur)), LOWER(unaccent(search_query))) > 0.2
      )
    LIMIT 6
  ),

  categories AS (
    SELECT DISTINCT
      categorie AS sugg,
      'categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY categorie) AS cnt,
      GREATEST(
        similarity(LOWER(unaccent(categorie)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(categorie))),
        similarity(LOWER(categorie), LOWER(search_query))
      )::real AS score,
      NULL::text AS eid
    FROM entreprise
    WHERE
      categorie IS NOT NULL
      AND categorie != ''
      AND (
        LOWER(unaccent(categorie)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(categorie) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(categorie)), LOWER(unaccent(search_query))) > 0.2
      )
    LIMIT 3
  ),

  sous_categories AS (
    SELECT DISTINCT
      sous_categories AS sugg,
      'sous_categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY sous_categories) AS cnt,
      GREATEST(
        similarity(LOWER(unaccent(sous_categories)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(sous_categories))),
        similarity(LOWER(sous_categories), LOWER(search_query))
      )::real AS score,
      NULL::text AS eid
    FROM entreprise
    WHERE
      sous_categories IS NOT NULL
      AND sous_categories != ''
      AND (
        LOWER(unaccent(sous_categories)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(sous_categories) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(sous_categories)), LOWER(unaccent(search_query))) > 0.2
      )
    LIMIT 4
  ),

  entreprises AS (
    SELECT DISTINCT
      nom AS sugg,
      'entreprise'::text AS typ,
      1::bigint AS cnt,
      GREATEST(
        similarity(LOWER(unaccent(nom)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(nom))),
        similarity(LOWER(nom), LOWER(search_query))
      )::real AS score,
      id::text AS eid
    FROM entreprise
    WHERE
      nom IS NOT NULL
      AND nom != ''
      AND (
        LOWER(unaccent(nom)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(nom) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(nom)), LOWER(unaccent(search_query))) > 0.2
      )
    LIMIT 4
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
    all_suggestions.score AS similarity_score,
    all_suggestions.eid AS entreprise_id
  FROM all_suggestions
  WHERE all_suggestions.score > 0.15
  ORDER BY
    CASE all_suggestions.typ
      WHEN 'secteur' THEN 1
      WHEN 'categorie' THEN 2
      WHEN 'sous_categorie' THEN 3
      WHEN 'entreprise' THEN 4
    END,
    all_suggestions.score DESC,
    all_suggestions.cnt DESC
  LIMIT 15;
END;
$$;
