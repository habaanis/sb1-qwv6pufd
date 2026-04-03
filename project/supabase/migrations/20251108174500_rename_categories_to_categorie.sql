/*
  # Rename categories column to categorie for consistency

  1. Changes
    - Rename `categories` column to `categorie` in `entreprise` table
    - This makes it consistent with `page_categorie` column naming
    - Normalized column `categories_norm` also needs updating
  
  2. Impact
    - Frontend code expects `categorie` (singular)
    - Maintains consistency with other singular column names
  
  3. Notes
    - Data is preserved during rename
    - Indexes and triggers are automatically updated
*/

-- Rename the main column
ALTER TABLE public.entreprise 
  RENAME COLUMN categories TO categorie;

-- Drop the old trigger temporarily
DROP TRIGGER IF EXISTS trg_update_entreprise_norm ON public.entreprise;

-- Update trigger function to use new column name
CREATE OR REPLACE FUNCTION update_entreprise_norm_columns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nom_norm := lower(unaccent(COALESCE(NEW.nom, '')));
  NEW.ville_norm := lower(unaccent(COALESCE(NEW.ville, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recreate trigger with correct column reference
CREATE TRIGGER trg_update_entreprise_norm
  BEFORE INSERT OR UPDATE OF nom, ville ON public.entreprise
  FOR EACH ROW
  EXECUTE FUNCTION update_entreprise_norm_columns();