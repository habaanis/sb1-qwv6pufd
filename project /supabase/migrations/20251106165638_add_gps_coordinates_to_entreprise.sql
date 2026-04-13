/*
  # Ajout des coordonnées GPS à la table entreprise
  
  1. Modifications
    - Ajout de la colonne `latitude` (numeric) - Latitude GPS
    - Ajout de la colonne `longitude` (numeric) - Longitude GPS
    
  2. Notes
    - Ces colonnes permettront la géolocalisation des établissements
    - Format numérique décimal pour la précision GPS
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN latitude numeric(10,7);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN longitude numeric(10,7);
  END IF;
END $$;

-- Index pour les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_entreprise_gps ON entreprise(latitude, longitude);