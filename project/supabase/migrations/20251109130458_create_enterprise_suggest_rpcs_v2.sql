/*
  # Create Enterprise Suggestion RPCs

  1. Functions Created
    - `enterprise_cities_suggest()` - Suggests cities from entreprise table
    - `enterprise_categories_suggest()` - Suggests categories from entreprise table
    - Updated `enterprise_search_list()` - Fixed to use correct column names

  2. Features
    - Accent-insensitive suggestions
    - Smart scoring (prefix matches first)
    - Deduplication
    - Fast suggestions for autocomplete

  3. Security
    - Public read access via existing RLS
*/

-- A) Suggestions de VILLES (depuis entreprise.ville)
CREATE OR REPLACE FUNCTION public.enterprise_cities_suggest(
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
  ORDER BY
    CASE
      WHEN p_q IS NULL OR length(trim(p_q)) < 2 THEN 1
      WHEN norm(v) LIKE norm(p_q || '%') THEN 0
      WHEN norm(v) LIKE norm('% ' || p_q || '%') THEN 1
      ELSE 2
    END,
    v ASC
  LIMIT COALESCE(p_limit, 10);
$$;

-- B) Suggestions de CATEGORIES (fusionne categorie + sous_categories)
CREATE OR REPLACE FUNCTION public.enterprise_categories_suggest(
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
        WHEN norm(c) LIKE norm(p_q || '%') THEN 0
        WHEN norm(c) LIKE norm('% ' || p_q || '%') THEN 1
        ELSE 2
      END AS score
    FROM normed
    WHERE (p_q IS NULL OR length(trim(p_q)) < 2)
       OR norm(c) LIKE norm('%' || p_q || '%')
  )
  SELECT categorie
  FROM scored
  ORDER BY score ASC, categorie ASC
  LIMIT COALESCE(p_limit, 12);
$$;

-- C) Update enterprise_search_list to use correct column names
CREATE OR REPLACE FUNCTION public.enterprise_search_list(
  p_q text,
  p_ville text DEFAULT NULL,
  p_categorie text DEFAULT NULL,
  p_limit int DEFAULT 24,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
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
      id, 
      nom, 
      ville, 
      categorie, 
      sous_categories, 
      description, 
      telephone, 
      site_web, 
      image_url,
      CASE
        WHEN p_q IS NULL OR length(trim(p_q)) < 2 THEN 0
        WHEN norm(nom) LIKE norm(p_q || '%') THEN 3
        WHEN norm(nom) LIKE norm('% ' || p_q || '%') THEN 2
        WHEN norm(nom) LIKE norm('%' || p_q || '%') THEN 1
        ELSE 0
      END AS score
    FROM filtres
  )
  SELECT id, nom, ville, categorie, sous_categories, description, telephone, site_web, image_url
  FROM scored
  ORDER BY score DESC, nom ASC
  LIMIT p_limit OFFSET p_offset;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.enterprise_cities_suggest(text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enterprise_categories_suggest(text, int) TO anon, authenticated;
