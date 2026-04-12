/*
  # Amélioration recherche fuzzy avec types corrects
  
  1. Fonction norm()
    - Normalise : minuscules + sans accents
    - Utilise unaccent extension
    
  2. Fuzzy search
    - Tolérance aux erreurs avec pg_trgm (seuil 0.3)
    - "électricien" trouve "electricien"
    - "denti" trouve "dentiste"
    - Insensible casse et accents
    
  3. Corrections
    - Type id = text (pas uuid)
    - Toutes colonnes retournées
*/

-- Créer fonction norm() si nécessaire
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

-- Drop et recréer suggestions VILLES avec fuzzy
DROP FUNCTION IF EXISTS public.enterprise_cities_suggest(text, int);

CREATE FUNCTION public.enterprise_cities_suggest(
  p_q text, 
  p_limit int DEFAULT 10
)
RETURNS TABLE (ville text)
LANGUAGE sql
STABLE
AS $$
  SELECT v
  FROM (
    SELECT DISTINCT trim(ville) AS v
    FROM public.entreprise
    WHERE COALESCE(trim(ville), '') <> ''
  ) t
  WHERE (p_q IS NULL OR length(trim(p_q)) < 2)
     OR norm(v) LIKE norm('%' || p_q || '%')
     OR similarity(norm(v), norm(p_q)) > 0.3
  ORDER BY
    CASE
      WHEN p_q IS NULL OR length(trim(p_q)) < 2 THEN 1
      WHEN norm(v) = norm(p_q) THEN -2
      WHEN norm(v) LIKE norm(p_q || '%') THEN -1
      ELSE similarity(norm(v), norm(p_q))
    END DESC,
    v ASC
  LIMIT COALESCE(p_limit, 10);
$$;

-- Drop et recréer suggestions CATEGORIES avec fuzzy
DROP FUNCTION IF EXISTS public.enterprise_categories_suggest(text, int);

CREATE FUNCTION public.enterprise_categories_suggest(
  p_q text, 
  p_limit int DEFAULT 12
)
RETURNS TABLE (categorie text)
LANGUAGE sql
STABLE
AS $$
  WITH cat AS (
    SELECT unnest(string_to_array(COALESCE(categorie, ''), ',')) AS c
    FROM public.entreprise
    UNION ALL
    SELECT unnest(string_to_array(COALESCE(sous_categories, ''), ',')) AS c
    FROM public.entreprise
  ),
  normed AS (
    SELECT trim(c) AS c FROM cat WHERE trim(c) <> ''
  ),
  scored AS (
    SELECT 
      DISTINCT c AS categorie,
      CASE
        WHEN p_q IS NULL OR length(trim(p_q)) < 2 THEN 1
        WHEN norm(c) = norm(p_q) THEN -2
        WHEN norm(c) LIKE norm(p_q || '%') THEN -1
        WHEN similarity(norm(c), norm(p_q)) > 0.3 THEN similarity(norm(c), norm(p_q))
        ELSE 999
      END AS score
    FROM normed
    WHERE (p_q IS NULL OR length(trim(p_q)) < 2)
       OR norm(c) LIKE norm('%' || p_q || '%')
       OR similarity(norm(c), norm(p_q)) > 0.3
  )
  SELECT categorie
  FROM scored
  WHERE score < 999
  ORDER BY score DESC, categorie ASC
  LIMIT COALESCE(p_limit, 12);
$$;

-- Drop et recréer recherche principale avec fuzzy
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
LANGUAGE sql
STABLE
AS $$
  WITH base AS (
    SELECT e.*
    FROM public.entreprise e
    WHERE
      (p_q IS NULL OR length(trim(p_q)) < 2)
      OR (
        norm(e.nom) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e.categorie, '')) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e.sous_categories, '')) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e.description, '')) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e.ville, '')) LIKE norm('%' || p_q || '%')
        OR similarity(norm(e.nom), norm(p_q)) > 0.3
        OR similarity(norm(COALESCE(e.categorie, '')), norm(p_q)) > 0.3
        OR similarity(norm(COALESCE(e.ville, '')), norm(p_q)) > 0.3
      )
  ),
  filtres AS (
    SELECT *
    FROM base
    WHERE (p_ville IS NULL OR norm(ville) = norm(p_ville))
      AND (
        p_categorie IS NULL
        OR norm(COALESCE(categorie, '')) LIKE norm('%' || p_categorie || '%')
        OR norm(COALESCE(sous_categories, '')) LIKE norm('%' || p_categorie || '%')
      )
  ),
  scored AS (
    SELECT
      f.id, 
      f.nom, 
      f.ville, 
      f.categorie, 
      f.sous_categories, 
      f.description, 
      f.telephone, 
      f.site_web, 
      f.image_url,
      CASE
        WHEN p_q IS NULL OR length(trim(p_q)) < 2 THEN 0
        WHEN norm(f.nom) = norm(p_q) THEN 10
        WHEN norm(f.nom) LIKE norm(p_q || '%') THEN 8
        WHEN norm(f.nom) LIKE norm('% ' || p_q || '%') THEN 6
        WHEN norm(f.nom) LIKE norm('%' || p_q || '%') THEN 4
        WHEN similarity(norm(f.nom), norm(p_q)) > 0.3 THEN 3 + similarity(norm(f.nom), norm(p_q))
        WHEN norm(COALESCE(f.categorie, '')) LIKE norm('%' || p_q || '%') THEN 2
        WHEN similarity(norm(COALESCE(f.categorie, '')), norm(p_q)) > 0.3 THEN 1 + similarity(norm(COALESCE(f.categorie, '')), norm(p_q))
        ELSE 0
      END AS score
    FROM filtres f
  )
  SELECT id, nom, ville, categorie, sous_categories, description, telephone, site_web, image_url
  FROM scored
  ORDER BY score DESC, nom ASC
  LIMIT p_limit OFFSET p_offset;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.norm(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enterprise_cities_suggest(text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enterprise_categories_suggest(text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enterprise_search_list(text, text, text, int, int) TO anon, authenticated;
