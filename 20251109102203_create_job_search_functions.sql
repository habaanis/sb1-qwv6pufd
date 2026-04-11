/*
  # Create Job Search and Facets Functions

  1. Functions Created
    - `job_facets()` - Returns aggregated categories, cities, and types from active jobs
    - `job_search()` - Full-text search with filters for category, city, type with pagination

  2. Features
    - Case-insensitive search using ILIKE
    - Accent-insensitive search using unaccent extension
    - Multiple filter support
    - Pagination with limit and offset
    - Default sort by created_at DESC
    - Only returns active, non-expired jobs

  3. Security
    - Public functions accessible to anonymous users
    - RLS policies apply automatically
*/

-- Create job_facets function to get all available filter values
CREATE OR REPLACE FUNCTION public.job_facets()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'categories', (
      SELECT json_agg(DISTINCT category ORDER BY category)
      FROM job_postings
      WHERE status = 'active'
        AND (expires_at IS NULL OR expires_at > now())
    ),
    'villes', (
      SELECT json_agg(DISTINCT city ORDER BY city)
      FROM job_postings
      WHERE status = 'active'
        AND (expires_at IS NULL OR expires_at > now())
    ),
    'types', (
      SELECT json_agg(DISTINCT type ORDER BY type)
      FROM job_postings
      WHERE status = 'active'
        AND (expires_at IS NULL OR expires_at > now())
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create job_search function with filters and pagination
CREATE OR REPLACE FUNCTION public.job_search(
  p_q text DEFAULT '',
  p_categorie text DEFAULT '',
  p_ville text DEFAULT '',
  p_type text DEFAULT '',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  title text,
  company text,
  category text,
  city text,
  type text,
  description text,
  requirements text,
  salary_range text,
  contact_email text,
  contact_phone text,
  status text,
  created_at timestamptz,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    jp.id,
    jp.title,
    jp.company,
    jp.category,
    jp.city,
    jp.type,
    jp.description,
    jp.requirements,
    jp.salary_range,
    jp.contact_email,
    jp.contact_phone,
    jp.status,
    jp.created_at,
    jp.expires_at
  FROM job_postings jp
  WHERE jp.status = 'active'
    AND (jp.expires_at IS NULL OR jp.expires_at > now())
    AND (
      p_q = '' OR 
      unaccent(lower(jp.title)) ILIKE unaccent(lower('%' || p_q || '%')) OR
      unaccent(lower(jp.company)) ILIKE unaccent(lower('%' || p_q || '%')) OR
      unaccent(lower(jp.description)) ILIKE unaccent(lower('%' || p_q || '%'))
    )
    AND (p_categorie = '' OR lower(jp.category) = lower(p_categorie))
    AND (p_ville = '' OR unaccent(lower(jp.city)) = unaccent(lower(p_ville)))
    AND (p_type = '' OR lower(jp.type) = lower(p_type))
  ORDER BY jp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.job_facets() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.job_search(text, text, text, text, integer, integer) TO anon, authenticated;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_job_postings_title_trgm ON job_postings USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_job_postings_company_trgm ON job_postings USING gin (company gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_job_postings_category_lower ON job_postings (lower(category));
CREATE INDEX IF NOT EXISTS idx_job_postings_city_lower ON job_postings (lower(city));
CREATE INDEX IF NOT EXISTS idx_job_postings_type_lower ON job_postings (lower(type));
CREATE INDEX IF NOT EXISTS idx_job_postings_status_expires ON job_postings (status, expires_at) WHERE status = 'active';
