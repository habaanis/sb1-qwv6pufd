/*
  # Add Trigram Indexes for Fast Search on Professeurs Prives

  1. Indexes Added
    - `idx_professeurs_nom_trgm` - GIN trigram index on `nom` for fast ILIKE searches
    - `idx_professeurs_matiere_trgm` - GIN trigram index on `matiere` for fast category searches

  2. Performance Impact
    - Dramatically speeds up autocomplete/search queries with ILIKE
    - Enables fuzzy search capabilities
    - Essential for instant search experience

  3. Notes
    - Uses pg_trgm extension (already enabled)
    - GIN indexes are optimal for text search
*/

-- Add trigram index on nom for fast name search
CREATE INDEX IF NOT EXISTS idx_professeurs_nom_trgm 
  ON professeurs_prives USING gin (nom gin_trgm_ops);

-- Add trigram index on matiere for fast subject search
CREATE INDEX IF NOT EXISTS idx_professeurs_matiere_trgm 
  ON professeurs_prives USING gin (matiere gin_trgm_ops);
