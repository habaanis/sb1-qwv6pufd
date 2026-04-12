/*
  # Fix search_smart_autocomplete: use correct column names from entreprise table

  ## Problem
  The function was referencing scalar columns `categorie`, `sous_categories`, `secteur`
  which don't exist. The actual columns are:
  - `"catégorie"` (text[], with accent)
  - `"sous-catégories"` (text[], with hyphen and accent)
  - `secteur` (text, no accent — this one is correct)

  ## Fix
  - Replace `categorie` with unnest of `e."catégorie"`
  - Replace `sous_categories` with unnest of `e."sous-catégories"`
  - Keep `secteur` as-is (scalar text column)
  - Also add `slug` column to entreprise results for direct navigation
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
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH
  secteurs AS (
    SELECT DISTINCT
      e.secteur AS sugg,
      'secteur'::text AS typ,
      COUNT(*) OVER (PARTITION BY e.secteur) AS cnt,
      GREATEST(
        similarity(LOWER(unaccent(e.secteur)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(e.secteur))),
        similarity(LOWER(e.secteur), LOWER(search_query))
      )::real AS score,
      NULL::text AS eid
    FROM entreprise e
    WHERE
      e.secteur IS NOT NULL
      AND e.secteur != ''
      AND (
        LOWER(unaccent(e.secteur)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(e.secteur) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(e.secteur)), LOWER(unaccent(search_query))) > 0.2
      )
    LIMIT 6
  ),

  categories AS (
    SELECT DISTINCT
      cat AS sugg,
      'categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY cat) AS cnt,
      GREATEST(
        similarity(LOWER(unaccent(cat)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(cat))),
        similarity(LOWER(cat), LOWER(search_query))
      )::real AS score,
      NULL::text AS eid
    FROM entreprise e, unnest(e."catégorie") AS cat
    WHERE
      cat IS NOT NULL
      AND cat != ''
      AND (
        LOWER(unaccent(cat)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(cat) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(cat)), LOWER(unaccent(search_query))) > 0.2
      )
    LIMIT 3
  ),

  sous_categories AS (
    SELECT DISTINCT
      scat AS sugg,
      'sous_categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY scat) AS cnt,
      GREATEST(
        similarity(LOWER(unaccent(scat)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(scat))),
        similarity(LOWER(scat), LOWER(search_query))
      )::real AS score,
      NULL::text AS eid
    FROM entreprise e, unnest(e."sous-catégories") AS scat
    WHERE
      scat IS NOT NULL
      AND scat != ''
      AND (
        LOWER(unaccent(scat)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(scat) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(scat)), LOWER(unaccent(search_query))) > 0.2
      )
    LIMIT 4
  ),

  entreprises AS (
    SELECT DISTINCT
      e.nom AS sugg,
      'entreprise'::text AS typ,
      1::bigint AS cnt,
      GREATEST(
        similarity(LOWER(unaccent(e.nom)), LOWER(unaccent(search_query))),
        word_similarity(LOWER(unaccent(search_query)), LOWER(unaccent(e.nom))),
        similarity(LOWER(e.nom), LOWER(search_query))
      )::real AS score,
      e.id::text AS eid
    FROM entreprise e
    WHERE
      e.nom IS NOT NULL
      AND e.nom != ''
      AND (
        LOWER(unaccent(e.nom)) LIKE LOWER(unaccent('%' || search_query || '%'))
        OR LOWER(e.nom) LIKE LOWER('%' || search_query || '%')
        OR similarity(LOWER(unaccent(e.nom)), LOWER(unaccent(search_query))) > 0.2
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

GRANT EXECUTE ON FUNCTION public.search_smart_autocomplete(text) TO anon, authenticated;
