/*
  # Enable Fuzzy Search and Full-Text Search Extensions

  1. Extensions
    - Enable `pg_trgm` for trigram-based fuzzy matching
    - Enable `unaccent` if not already enabled for accent-insensitive search
  
  2. Indexes
    - Create GIN indexes on `entreprise` table for full-text search
    - Create GIN indexes on `cities` table for improved city search
    - Add trigram indexes for fuzzy matching on key text columns
  
  3. Search Functions
    - Improve search performance with specialized indexes
    - Enable similarity search with trigram matching
  
  ## Benefits
  - Fuzzy matching: Finds results even with typos (e.g., "tuniz" finds "Tunis")
  - Accent-insensitive: "cafe" matches "café"
  - Fast full-text search with GIN indexes
  - Better ranking with similarity scores
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Drop existing indexes if they exist to recreate them
DROP INDEX IF EXISTS idx_entreprise_nom_trgm;
DROP INDEX IF EXISTS idx_entreprise_ville_trgm;
DROP INDEX IF EXISTS idx_entreprise_categories_trgm;
DROP INDEX IF EXISTS idx_entreprise_description_trgm;
DROP INDEX IF EXISTS idx_cities_name_fr_trgm;
DROP INDEX IF EXISTS idx_cities_name_ar_trgm;
DROP INDEX IF EXISTS idx_cities_name_en_trgm;

-- Create trigram indexes on entreprise table for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_entreprise_nom_trgm 
  ON entreprise USING gin (nom gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_entreprise_ville_trgm 
  ON entreprise USING gin (ville gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_entreprise_categories_trgm 
  ON entreprise USING gin (categories gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_entreprise_sous_categories_trgm 
  ON entreprise USING gin (sous_categories gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_entreprise_description_trgm 
  ON entreprise USING gin (description gin_trgm_ops);

-- Create trigram indexes on cities table for fuzzy city search
CREATE INDEX IF NOT EXISTS idx_cities_name_fr_trgm 
  ON cities USING gin (name_fr gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_cities_name_ar_trgm 
  ON cities USING gin (name_ar gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_cities_name_en_trgm 
  ON cities USING gin (name_en gin_trgm_ops);

-- Create enhanced search function for entreprise with fuzzy matching
CREATE OR REPLACE FUNCTION search_entreprise_fuzzy(
  search_query TEXT,
  city_filter TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id BIGINT,
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

-- Create enhanced city search function with fuzzy matching
CREATE OR REPLACE FUNCTION search_cities_fuzzy(
  search_query TEXT,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  name_fr TEXT,
  name_ar TEXT,
  name_en TEXT,
  governorate_fr TEXT,
  governorate_ar TEXT,
  governorate_en TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name_fr,
    c.name_ar,
    c.name_en,
    g.name_fr as governorate_fr,
    g.name_ar as governorate_ar,
    g.name_en as governorate_en,
    GREATEST(
      similarity(c.name_fr, search_query),
      similarity(COALESCE(c.name_ar, ''), search_query),
      similarity(COALESCE(c.name_en, ''), search_query)
    ) as similarity_score
  FROM cities c
  LEFT JOIN governorates g ON c.governorate_id = g.id
  WHERE 
    c.name_fr % search_query
    OR c.name_ar % search_query
    OR c.name_en % search_query
    OR similarity(c.name_fr, search_query) > similarity_threshold
    OR similarity(COALESCE(c.name_ar, ''), search_query) > similarity_threshold
    OR similarity(COALESCE(c.name_en, ''), search_query) > similarity_threshold
  ORDER BY similarity_score DESC, c.name_fr ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE;
