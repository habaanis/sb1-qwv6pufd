/*
  # Fix Fuzzy Search Functions - UUID Type

  1. Problem
    - The entreprise.id column is UUID type, not BIGINT
    - The search_entreprise_fuzzy function was declaring id as BIGINT
    - This caused a type mismatch error
  
  2. Solution
    - Drop and recreate search_entreprise_fuzzy with correct UUID type
    - Update return type to match actual table structure
  
  3. Changes
    - Change id from BIGINT to UUID in function return type
    - Ensure all column types match the actual table
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS search_entreprise_fuzzy(TEXT, TEXT, TEXT, FLOAT);

-- Recreate with correct UUID type
CREATE OR REPLACE FUNCTION search_entreprise_fuzzy(
  search_query TEXT,
  city_filter TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  nom TEXT,
  ville TEXT,
  categories TEXT,
  sous_categories TEXT,
  description TEXT,
  telephone TEXT,
  site_web TEXT,
  email TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nom,
    e.ville,
    e.categories,
    e.sous_categories,
    e.description,
    e.telephone,
    e.site_web,
    e.email,
    GREATEST(
      similarity(e.nom, search_query),
      similarity(COALESCE(e.categories, ''), search_query),
      similarity(COALESCE(e.sous_categories, ''), search_query),
      similarity(COALESCE(e.ville, ''), search_query),
      similarity(COALESCE(e.description, ''), search_query) * 0.5
    ) as similarity_score
  FROM entreprise e
  WHERE 
    e.status = 'approved'
    AND (
      e.nom % search_query
      OR e.categories % search_query
      OR e.sous_categories % search_query
      OR e.ville % search_query
      OR e.description % search_query
      OR similarity(e.nom, search_query) > similarity_threshold
      OR similarity(COALESCE(e.categories, ''), search_query) > similarity_threshold
      OR similarity(COALESCE(e.sous_categories, ''), search_query) > similarity_threshold
      OR similarity(COALESCE(e.ville, ''), search_query) > similarity_threshold
    )
    AND (city_filter IS NULL OR e.ville ILIKE '%' || city_filter || '%')
    AND (category_filter IS NULL OR e.categories ILIKE '%' || category_filter || '%')
  ORDER BY similarity_score DESC, e.nom ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;
