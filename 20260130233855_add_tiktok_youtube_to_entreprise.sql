/*
  # Ajout des colonnes TikTok et YouTube à la table entreprise

  1. Nouvelles colonnes
    - `tiktok_url` (text) - URL du profil TikTok
    - `youtube_url` (text) - URL de la chaîne YouTube

  2. Notes
    - Colonnes optionnelles (nullable)
    - Complète l'écosystème digital des entreprises
*/

DO $$ 
BEGIN
  -- Ajouter tiktok_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entreprise' AND column_name = 'tiktok_url'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN tiktok_url text;
  END IF;

  -- Ajouter youtube_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entreprise' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN youtube_url text;
  END IF;
END $$;