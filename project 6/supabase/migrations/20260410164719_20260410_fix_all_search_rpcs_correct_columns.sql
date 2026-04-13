/*
  # Correction CRITIQUE de toutes les fonctions RPC de recherche

  ## Problèmes corrigés
  1. Les colonnes "catégorie", "sous-catégories", "secteur" sont de type TEXT[] (tableaux), pas TEXT
  2. Les anciennes fonctions utilisaient e.categorie (sans accent) au lieu de e."catégorie"
  3. Les anciennes fonctions utilisaient e.sous_categories au lieu de e."sous-catégories"
  4. Le filtre status IN ('active', 'approved') - il n'existe que 'approved' dans la table
  5. Toutes les fonctions sont recréées avec les bons noms de colonnes et la bonne gestion des arrays

  ## Fonctions recréées
  - norm(text) : normalisation accent-insensible
  - enterprise_suggest_filtered : suggestions entreprises (pour useSuggest)
  - enterprise_city_suggest : suggestions villes (pour useSuggest)
  - enterprise_cities_suggest : suggestions villes v2 (pour useEntrepriseSuggest)
  - enterprise_categories_suggest : suggestions catégories (pour useEntrepriseSuggest)
  - enterprise_search_list : liste recherche principale
  - search_entreprise_smart : recherche intelligente avec score
  - search_smart_autocomplete : autocomplétion unifiée
*/

-- =============================================
-- 1. Fonction norm() - normalisation
-- =============================================
CREATE OR REPLACE FUNCTION public.norm(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN txt IS NULL THEN NULL
    ELSE lower(unaccent(txt))
  END
$$;

GRANT EXECUTE ON FUNCTION public.norm(text) TO anon, authenticated;

-- =============================================
-- 2. enterprise_suggest_filtered (pour useSuggest)
-- =============================================
DROP FUNCTION IF EXISTS public.enterprise_suggest_filtered(text, int, text, text);

CREATE FUNCTION public.enterprise_suggest_filtered(
  q text,
  p_limit int DEFAULT 8,
  p_categorie text DEFAULT NULL,
  p_ville text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  nom text,
  ville text,
  categorie text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id::text,
    e.nom,
    e.ville,
    COALESCE(array_to_string(e."catégorie", ', '), '') AS categorie
  FROM public.entreprise e
  WHERE
    e.status = 'approved'
    AND e.nom IS NOT NULL
    AND (
      norm(e.nom) LIKE norm('%' || q || '%')
      OR similarity(norm(e.nom), norm(q)) > 0.3
    )
    AND (
      p_ville IS NULL
      OR norm(COALESCE(e.ville, '')) LIKE norm('%' || p_ville || '%')
    )
    AND (
      p_categorie IS NULL
      OR EXISTS (
        SELECT 1 FROM unnest(e."catégorie") AS cat
        WHERE norm(cat) LIKE norm('%' || p_categorie || '%')
      )
    )
  ORDER BY
    CASE
      WHEN norm(e.nom) LIKE norm(q || '%') THEN 0
      WHEN norm(e.nom) LIKE norm('%' || q || '%') THEN 1
      ELSE 2
    END,
    e.nom ASC
  LIMIT COALESCE(p_limit, 8);
$$;

GRANT EXECUTE ON FUNCTION public.enterprise_suggest_filtered(text, int, text, text) TO anon, authenticated;

-- =============================================
-- 3. enterprise_city_suggest (pour useSuggest)
-- =============================================
DROP FUNCTION IF EXISTS public.enterprise_city_suggest(text, int);

CREATE FUNCTION public.enterprise_city_suggest(
  q text,
  p_limit int DEFAULT 8
)
RETURNS TABLE (ville text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT trim(e.ville) AS ville
  FROM public.entreprise e
  WHERE
    COALESCE(trim(e.ville), '') <> ''
    AND norm(trim(e.ville)) LIKE norm('%' || q || '%')
  ORDER BY trim(e.ville) ASC
  LIMIT COALESCE(p_limit, 8);
$$;

GRANT EXECUTE ON FUNCTION public.enterprise_city_suggest(text, int) TO anon, authenticated;

-- =============================================
-- 4. enterprise_cities_suggest (pour useEntrepriseSuggest)
-- =============================================
DROP FUNCTION IF EXISTS public.enterprise_cities_suggest(text, int);

CREATE FUNCTION public.enterprise_cities_suggest(
  p_q text,
  p_limit int DEFAULT 10
)
RETURNS TABLE (ville text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT trim(e.ville) AS ville
  FROM public.entreprise e
  WHERE
    COALESCE(trim(e.ville), '') <> ''
    AND (
      norm(trim(e.ville)) LIKE norm('%' || p_q || '%')
      OR similarity(norm(trim(e.ville)), norm(p_q)) > 0.3
    )
  ORDER BY trim(e.ville) ASC
  LIMIT COALESCE(p_limit, 10);
$$;

GRANT EXECUTE ON FUNCTION public.enterprise_cities_suggest(text, int) TO anon, authenticated;

-- =============================================
-- 5. enterprise_categories_suggest (pour useEntrepriseSuggest)
-- =============================================
DROP FUNCTION IF EXISTS public.enterprise_categories_suggest(text, int);

CREATE FUNCTION public.enterprise_categories_suggest(
  p_q text,
  p_limit int DEFAULT 12
)
RETURNS TABLE (categorie text)
LANGUAGE sql
STABLE
AS $$
  WITH all_cats AS (
    SELECT DISTINCT trim(cat) AS c
    FROM public.entreprise,
         unnest("catégorie") AS cat
    WHERE trim(cat) <> ''
    UNION
    SELECT DISTINCT trim(scat) AS c
    FROM public.entreprise,
         unnest("sous-catégories") AS scat
    WHERE trim(scat) <> ''
  )
  SELECT c AS categorie
  FROM all_cats
  WHERE
    norm(c) LIKE norm('%' || p_q || '%')
    OR similarity(norm(c), norm(p_q)) > 0.3
  ORDER BY
    CASE
      WHEN norm(c) = norm(p_q) THEN 0
      WHEN norm(c) LIKE norm(p_q || '%') THEN 1
      WHEN norm(c) LIKE norm('%' || p_q || '%') THEN 2
      ELSE 3
    END,
    c ASC
  LIMIT COALESCE(p_limit, 12);
$$;

GRANT EXECUTE ON FUNCTION public.enterprise_categories_suggest(text, int) TO anon, authenticated;

-- =============================================
-- 6. enterprise_search_list (recherche principale)
-- =============================================
DROP FUNCTION IF EXISTS public.enterprise_search_list(text, text, text, int, int);

CREATE FUNCTION public.enterprise_search_list(
  p_q text,
  p_ville text DEFAULT NULL,
  p_categorie text DEFAULT NULL,
  p_limit int DEFAULT 24,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id text,
  nom text,
  ville text,
  categorie text,
  sous_categories text,
  description text,
  telephone text,
  site_web text,
  image_url text
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id::text,
    e.nom,
    e.ville,
    array_to_string(e."catégorie", ', ') AS categorie,
    array_to_string(e."sous-catégories", ', ') AS sous_categories,
    e.description,
    e.telephone,
    e.site_web,
    e.image_url
  FROM public.entreprise e
  WHERE
    (
      p_q IS NULL OR length(trim(p_q)) < 2
      OR norm(e.nom) LIKE norm('%' || p_q || '%')
      OR similarity(norm(e.nom), norm(p_q)) > 0.3
      OR EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE norm(c) LIKE norm('%' || p_q || '%'))
      OR EXISTS (SELECT 1 FROM unnest(e."sous-catégories") sc WHERE norm(sc) LIKE norm('%' || p_q || '%'))
      OR norm(COALESCE(e.description, '')) LIKE norm('%' || p_q || '%')
    )
    AND (p_ville IS NULL OR norm(COALESCE(e.ville, '')) LIKE norm('%' || p_ville || '%'))
    AND (
      p_categorie IS NULL
      OR EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE norm(c) LIKE norm('%' || p_categorie || '%'))
      OR EXISTS (SELECT 1 FROM unnest(e."sous-catégories") sc WHERE norm(sc) LIKE norm('%' || p_categorie || '%'))
    )
  ORDER BY e.nom ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.enterprise_search_list(text, text, text, int, int) TO anon, authenticated;

-- =============================================
-- 7. search_entreprise_smart (pour SearchBar.tsx)
-- =============================================
DROP FUNCTION IF EXISTS public.search_entreprise_smart(text, text, text, text, int);

CREATE FUNCTION public.search_entreprise_smart(
  p_q text,
  p_ville text DEFAULT NULL,
  p_categorie text DEFAULT NULL,
  p_scope text DEFAULT NULL,
  p_limit int DEFAULT 30
)
RETURNS TABLE (
  id text,
  nom text,
  ville text,
  categorie text,
  sous_categories text,
  description text,
  telephone text,
  site_web text,
  image_url text,
  gouvernorat text,
  score numeric
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH scored AS (
    SELECT
      e.id::text AS eid,
      e.nom AS enom,
      e.ville AS eville,
      array_to_string(e."catégorie", ', ') AS ecat,
      array_to_string(e."sous-catégories", ', ') AS escat,
      e.description AS edesc,
      e.telephone AS etel,
      e.site_web AS eweb,
      e.image_url AS eimg,
      e.gouvernorat AS egouv,
      CASE
        WHEN p_q IS NULL OR length(trim(p_q)) < 2 THEN 0::numeric
        WHEN EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE norm(c) = norm(p_q)) THEN 100::numeric
        WHEN EXISTS (SELECT 1 FROM unnest(e."sous-catégories") sc WHERE norm(sc) = norm(p_q)) THEN 100::numeric
        WHEN EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE norm(c) LIKE norm(p_q || '%')) THEN 50::numeric
        WHEN EXISTS (SELECT 1 FROM unnest(e."sous-catégories") sc WHERE norm(sc) LIKE norm(p_q || '%')) THEN 50::numeric
        WHEN EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE norm(c) LIKE norm('%' || p_q || '%')) THEN 30::numeric
        WHEN EXISTS (SELECT 1 FROM unnest(e."sous-catégories") sc WHERE norm(sc) LIKE norm('%' || p_q || '%')) THEN 30::numeric
        WHEN EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE similarity(norm(c), norm(p_q)) > 0.3) THEN 25::numeric
        WHEN norm(e.nom) = norm(p_q) THEN 20::numeric
        WHEN norm(e.nom) LIKE norm(p_q || '%') THEN 15::numeric
        WHEN norm(e.nom) LIKE norm('%' || p_q || '%') THEN 10::numeric
        WHEN similarity(norm(e.nom), norm(p_q)) > 0.3 THEN 8::numeric
        WHEN norm(COALESCE(e.description, '')) LIKE norm('%' || p_q || '%') THEN 2::numeric
        ELSE 0::numeric
      END AS rscore
    FROM public.entreprise e
    WHERE
      (
        p_q IS NULL OR length(trim(p_q)) < 2
        OR norm(e.nom) LIKE norm('%' || p_q || '%')
        OR similarity(norm(e.nom), norm(p_q)) > 0.3
        OR EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE norm(c) LIKE norm('%' || p_q || '%') OR similarity(norm(c), norm(p_q)) > 0.3)
        OR EXISTS (SELECT 1 FROM unnest(e."sous-catégories") sc WHERE norm(sc) LIKE norm('%' || p_q || '%'))
        OR norm(COALESCE(e.description, '')) LIKE norm('%' || p_q || '%')
      )
      AND (
        p_ville IS NULL OR length(trim(p_ville)) = 0
        OR norm(COALESCE(e.ville, '')) LIKE norm('%' || p_ville || '%')
        OR norm(COALESCE(e.gouvernorat, '')) = norm(p_ville)
      )
      AND (
        p_categorie IS NULL
        OR EXISTS (SELECT 1 FROM unnest(e."catégorie") c WHERE norm(c) LIKE norm('%' || p_categorie || '%'))
        OR EXISTS (SELECT 1 FROM unnest(e."sous-catégories") sc WHERE norm(sc) LIKE norm('%' || p_categorie || '%'))
      )
      AND (
        p_scope IS NULL
        OR (p_scope = 'magasin' AND e."page commerce local" = true)
        OR (p_scope = 'tourism' AND e."liste pages" @> ARRAY['tourisme local & expatriation'])
        OR (p_scope = 'services' AND e."liste pages" @> ARRAY['services citoyens'])
        OR p_scope NOT IN ('magasin', 'tourism', 'services')
      )
  )
  SELECT eid, enom, eville, ecat, escat, edesc, etel, eweb, eimg, egouv, rscore
  FROM scored
  WHERE rscore > 0 OR p_q IS NULL OR length(trim(p_q)) < 2
  ORDER BY rscore DESC, enom ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_entreprise_smart(text, text, text, text, int) TO anon, authenticated;

-- =============================================
-- 8. search_smart_autocomplete (pour UnifiedSearchBar)
-- =============================================
DROP FUNCTION IF EXISTS public.search_smart_autocomplete(text);

CREATE FUNCTION public.search_smart_autocomplete(search_query text)
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
    SELECT
      trim(s) AS sugg,
      'secteur'::text AS typ,
      COUNT(*) OVER (PARTITION BY trim(s)) AS cnt,
      GREATEST(
        similarity(norm(trim(s)), norm(search_query)),
        word_similarity(norm(search_query), norm(trim(s)))
      )::real AS score,
      NULL::text AS eid
    FROM public.entreprise,
         unnest(secteur) AS s
    WHERE
      trim(s) IS NOT NULL AND trim(s) <> ''
      AND (
        norm(trim(s)) LIKE norm('%' || search_query || '%')
        OR similarity(norm(trim(s)), norm(search_query)) > 0.2
      )
    LIMIT 6
  ),

  categories AS (
    SELECT
      trim(c) AS sugg,
      'categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY trim(c)) AS cnt,
      GREATEST(
        similarity(norm(trim(c)), norm(search_query)),
        word_similarity(norm(search_query), norm(trim(c)))
      )::real AS score,
      NULL::text AS eid
    FROM public.entreprise,
         unnest("catégorie") AS c
    WHERE
      trim(c) IS NOT NULL AND trim(c) <> ''
      AND (
        norm(trim(c)) LIKE norm('%' || search_query || '%')
        OR similarity(norm(trim(c)), norm(search_query)) > 0.2
      )
    LIMIT 4
  ),

  sous_categories AS (
    SELECT
      trim(sc) AS sugg,
      'sous_categorie'::text AS typ,
      COUNT(*) OVER (PARTITION BY trim(sc)) AS cnt,
      GREATEST(
        similarity(norm(trim(sc)), norm(search_query)),
        word_similarity(norm(search_query), norm(trim(sc)))
      )::real AS score,
      NULL::text AS eid
    FROM public.entreprise,
         unnest("sous-catégories") AS sc
    WHERE
      trim(sc) IS NOT NULL AND trim(sc) <> ''
      AND (
        norm(trim(sc)) LIKE norm('%' || search_query || '%')
        OR similarity(norm(trim(sc)), norm(search_query)) > 0.2
      )
    LIMIT 4
  ),

  entreprises AS (
    SELECT
      e.nom AS sugg,
      'entreprise'::text AS typ,
      1::bigint AS cnt,
      GREATEST(
        similarity(norm(e.nom), norm(search_query)),
        word_similarity(norm(search_query), norm(e.nom))
      )::real AS score,
      e.id::text AS eid
    FROM public.entreprise e
    WHERE
      e.nom IS NOT NULL AND e.nom <> ''
      AND (
        norm(e.nom) LIKE norm('%' || search_query || '%')
        OR similarity(norm(e.nom), norm(search_query)) > 0.2
      )
    LIMIT 4
  ),

  all_sugg AS (
    SELECT * FROM secteurs
    UNION ALL
    SELECT * FROM categories
    UNION ALL
    SELECT * FROM sous_categories
    UNION ALL
    SELECT * FROM entreprises
  )

  SELECT
    sugg AS suggestion,
    typ AS type,
    cnt AS count,
    score AS similarity_score,
    eid AS entreprise_id
  FROM all_sugg
  WHERE score > 0.1
  ORDER BY
    CASE typ
      WHEN 'secteur' THEN 1
      WHEN 'categorie' THEN 2
      WHEN 'sous_categorie' THEN 3
      WHEN 'entreprise' THEN 4
    END,
    score DESC,
    cnt DESC
  LIMIT 15;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_smart_autocomplete(text) TO anon, authenticated;
