/*
  # Enable Fuzzy Search System

  1. Extensions
    - Enable `pg_trgm` for trigram similarity matching (fast fuzzy search)
    - Enable `unaccent` for accent-insensitive search
  
  2. Normalized Columns
    - Add `nom_norm` to `entreprise` table (lowercase, unaccented name)
    - Add `ville_norm` to `entreprise` table (lowercase, unaccented city)
    - Maintained via trigger for automatic updates
  
  3. Trigram Indexes
    - Create GIN indexes on normalized columns for ultra-fast similarity searches
  
  4. Trigger Function
    - Automatically updates normalized columns on INSERT/UPDATE
  
  5. Benefits
    - Search without worrying about accents (café = cafe)
    - Find similar words (dentiste ≈ dentaire)
    - Fast autocomplete with prefix matching
    - Tolerant to typos and variations
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add normalized columns to entreprise table
ALTER TABLE public.entreprise
  ADD COLUMN IF NOT EXISTS nom_norm text;

ALTER TABLE public.entreprise
  ADD COLUMN IF NOT EXISTS ville_norm text;

-- Create trigger function to maintain normalized columns
CREATE OR REPLACE FUNCTION update_entreprise_norm_columns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nom_norm := lower(unaccent(COALESCE(NEW.nom, '')));
  NEW.ville_norm := lower(unaccent(COALESCE(NEW.ville, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-update normalized columns
DROP TRIGGER IF EXISTS trg_update_entreprise_norm ON public.entreprise;
CREATE TRIGGER trg_update_entreprise_norm
  BEFORE INSERT OR UPDATE OF nom, ville ON public.entreprise
  FOR EACH ROW
  EXECUTE FUNCTION update_entreprise_norm_columns();

-- Populate existing rows with normalized values
UPDATE public.entreprise
SET 
  nom_norm = lower(unaccent(COALESCE(nom, ''))),
  ville_norm = lower(unaccent(COALESCE(ville, '')))
WHERE nom_norm IS NULL OR ville_norm IS NULL;

-- Create trigram indexes for ultra-fast fuzzy search
CREATE INDEX IF NOT EXISTS idx_ent_nom_norm_trgm
  ON public.entreprise USING gin (nom_norm gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_ent_ville_norm_trgm
  ON public.entreprise USING gin (ville_norm gin_trgm_ops);