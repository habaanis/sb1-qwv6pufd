/*
  # Ajout is_premium et company_address à job_postings

  1. Modifications
    - Ajout de `is_premium` (boolean) - Indique si l'offre d'emploi est premium
    - Ajout de `company_address` (text) - Adresse complète de l'entreprise
  
  2. Valeurs par défaut
    - `is_premium` DEFAULT false - Toutes les offres sont standard par défaut
    - `company_address` nullable - Champ optionnel
  
  3. Sécurité
    - Aucune modification des policies RLS existantes nécessaire
*/

-- Ajout de la colonne is_premium si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN is_premium BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Ajout de la colonne company_address si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'company_address'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN company_address TEXT;
  END IF;
END $$;

-- Index pour filtrer rapidement les offres premium
CREATE INDEX IF NOT EXISTS idx_job_postings_is_premium ON job_postings(is_premium) WHERE is_premium = true;
