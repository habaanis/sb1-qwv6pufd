/*
  # Ajout des colonnes pour la vidéo, le pack et les images

  1. Nouvelles colonnes
    - `video_url` (text) - URL de la vidéo de présentation
    - `pack_type` (text) - Type de pack choisi (Découverte, Artisan, Premium, Elite Pro)
    - `image_url` (text) - URLs des images (format JSON ou texte séparé)
    - `facebook_url` (text) - URL Facebook
    - `instagram_url` (text) - URL Instagram
    - `linkedin_url` (text) - URL LinkedIn
    - `tiktok_url` (text) - URL TikTok
    - `youtube_url` (text) - URL YouTube

  2. Notes
    - Toutes les colonnes sont optionnelles (nullable)
    - Compatible avec la structure Airtable existante
*/

DO $$ 
BEGIN
  -- Ajouter video_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN video_url text;
  END IF;

  -- Ajouter pack_type si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'pack_type'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN pack_type text;
  END IF;

  -- Ajouter image_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN image_url text;
  END IF;

  -- Ajouter facebook_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'facebook_url'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN facebook_url text;
  END IF;

  -- Ajouter instagram_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'instagram_url'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN instagram_url text;
  END IF;

  -- Ajouter linkedin_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN linkedin_url text;
  END IF;

  -- Ajouter tiktok_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'tiktok_url'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN tiktok_url text;
  END IF;

  -- Ajouter youtube_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN youtube_url text;
  END IF;
END $$;