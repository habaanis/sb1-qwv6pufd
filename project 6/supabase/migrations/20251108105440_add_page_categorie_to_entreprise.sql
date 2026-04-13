/*
  # Add page_categorie column to entreprise table

  1. Changes
    - Add `page_categorie` column to `entreprise` table
    - Type: TEXT with CHECK constraint
    - Allowed values: 'sante', 'education', 'administration', 'loisirs', 'magasin', 'marche_local'
    - Default: NULL (existing records can be updated gradually)
    - Add index for filtering performance

  2. Notes
    - Column is nullable to allow existing records
    - CHECK constraint ensures only valid categories
    - Index added for efficient category-based queries
*/

-- Add page_categorie column with constraint
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS page_categorie TEXT
CHECK (page_categorie IN ('sante', 'education', 'administration', 'loisirs', 'magasin', 'marche_local'));

-- Add comment for documentation
COMMENT ON COLUMN entreprise.page_categorie IS 'Page category for intelligent routing: sante, education, administration, loisirs, magasin, marche_local';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_entreprise_page_categorie 
ON entreprise(page_categorie) 
WHERE page_categorie IS NOT NULL;
