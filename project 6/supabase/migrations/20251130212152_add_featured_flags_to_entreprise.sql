/*
  # Add featured flags to entreprise table

  1. New Columns
    - `home_featured` (boolean) - Flag to feature business on home page
    - `citizen_featured` (boolean) - Flag to feature business on citizens page

  2. Changes
    - Add two boolean columns with default false
    - These flags allow selective display of featured businesses on different pages

  3. Notes
    - Admins can manually set these flags to true for featured businesses
    - Businesses with home_featured=true appear on home page banner
    - Businesses with citizen_featured=true appear on citizens page banner
*/

-- Add home_featured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'home_featured'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN home_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add citizen_featured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'citizen_featured'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN citizen_featured boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entreprise_home_featured ON entreprise(home_featured) WHERE home_featured = true;
CREATE INDEX IF NOT EXISTS idx_entreprise_citizen_featured ON entreprise(citizen_featured) WHERE citizen_featured = true;

-- Set some sample featured businesses for testing
-- Update businesses with images to be featured on home page
UPDATE entreprise
SET home_featured = true
WHERE id IN (
  SELECT id FROM entreprise
  WHERE image_url IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 8
);

-- Update businesses in commerce categories to be featured on citizens page
UPDATE entreprise
SET citizen_featured = true
WHERE id IN (
  SELECT id FROM entreprise
  WHERE categorie IN ('Commerce', 'Magasin', 'Supermarché', 'Épicerie', 'Boulangerie', 'Boutique')
  ORDER BY created_at DESC
  LIMIT 8
);
