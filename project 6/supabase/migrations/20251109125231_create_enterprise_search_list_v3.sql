/*
  # Create Enterprise Search List RPC

  1. Functions Created
    - `norm()` - Normalizes text (lowercase + unaccent)
    - `enterprise_search_list()` - Main search function for enterprise listing page

  2. Features
    - Accent-insensitive search using norm()
    - Case-insensitive search
    - Minimum 2 characters for query
    - Filters: city, category
    - Scoring: prioritizes matches at start of name
    - Pagination with limit/offset

  3. Security
    - Public read access via RLS
    - STABLE function for performance
*/

-- Normalization function (uses unaccent extension)
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

-- Main search RPC for enterprise listing
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
      AND (p_categorie IS NULL OR norm(categorie) LIKE norm('%' || p_categorie || '%'))
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
GRANT EXECUTE ON FUNCTION public.norm(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enterprise_search_list(text, text, text, int, int) TO anon, authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.entreprise ENABLE ROW LEVEL SECURITY;

-- Create public read policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' 
      AND tablename = 'entreprise' 
      AND policyname = 'public can read entreprise'
  ) THEN
    CREATE POLICY "public can read entreprise" 
      ON public.entreprise
      FOR SELECT 
      TO anon, authenticated 
      USING (true);
  END IF;
END$$;
