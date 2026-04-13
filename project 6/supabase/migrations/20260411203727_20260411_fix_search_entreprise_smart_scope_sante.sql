/*
  # Fix search_entreprise_smart: handle p_scope='santé' and all liste-pages scopes

  ## Problem
  The previous RPC only handled p_scope IN ('magasin', 'tourism', 'services').
  When p_scope='santé' (used by CitizensHealth CategorySearchBar), it fell into
  the catch-all `p_scope NOT IN (...)` branch which ignored the scope entirely,
  returning all categories including pharmacies when searching for doctors.

  ## Fix
  Add explicit handling for all "liste pages" scopes:
  - 'santé' → filters to "liste pages" @> ARRAY['santé']
  - 'loisirs' → filters to "liste pages" @> ARRAY['loisirs']
  - 'tourisme' / 'tourism' → existing logic
  - 'services' → existing logic
  - 'magasin' → existing logic (page commerce local)
  - any other unknown scope → no filter (fallback)
*/

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
        OR (p_scope IN ('tourisme', 'tourism', 'tourisme local & expatriation') AND e."liste pages" @> ARRAY['tourisme local & expatriation'])
        OR (p_scope = 'services' AND e."liste pages" @> ARRAY['services citoyens'])
        OR (p_scope IN ('santé', 'sante') AND e."liste pages" @> ARRAY['santé'])
        OR (p_scope IN ('loisirs', 'leisure') AND e."liste pages" @> ARRAY['loisirs'])
        OR (p_scope = 'education' AND e."liste pages" @> ARRAY['education'])
        OR (p_scope NOT IN ('magasin', 'tourism', 'tourisme', 'tourisme local & expatriation', 'services', 'santé', 'sante', 'loisirs', 'leisure', 'education'))
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
