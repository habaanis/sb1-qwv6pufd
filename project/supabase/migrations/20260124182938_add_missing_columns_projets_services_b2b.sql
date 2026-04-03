/*
  # Ajout de colonnes manquantes à projets_services_b2b
  
  1. Modifications
    - Ajout de la colonne `email` (text, nullable) pour séparer l'email du téléphone
    - Ajout de la colonne `telephone` (text, nullable) pour séparer le téléphone de l'email
    - Ajout de la colonne `adresse` (text, nullable) pour l'adresse physique distincte de la localisation
    - Ajout de la colonne `nom_entreprise` (text, nullable) pour le nom de l'entreprise
    - Ajout de la colonne `is_premium` (boolean, default false) pour identifier les annonces premium
    - Ajout de la colonne `created_by` (uuid, nullable) pour tracer qui a créé l'annonce
    
  2. Sécurité
    - Activation de Row Level Security (RLS)
    - Ajout d'une politique pour permettre la lecture publique
    - Ajout d'une politique pour permettre l'insertion publique (formulaires anonymes)
    - Ajout d'une politique pour permettre la modification par le créateur
*/

-- Ajout des colonnes manquantes (seulement si elles n'existent pas déjà)
DO $$ 
BEGIN
  -- Ajout de la colonne email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projets_services_b2b' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN email text;
  END IF;

  -- Ajout de la colonne telephone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projets_services_b2b' 
    AND column_name = 'telephone'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN telephone text;
  END IF;

  -- Ajout de la colonne adresse
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projets_services_b2b' 
    AND column_name = 'adresse'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN adresse text;
  END IF;

  -- Ajout de la colonne nom_entreprise
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projets_services_b2b' 
    AND column_name = 'nom_entreprise'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN nom_entreprise text;
  END IF;

  -- Ajout de la colonne is_premium
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projets_services_b2b' 
    AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN is_premium boolean DEFAULT false;
  END IF;

  -- Ajout de la colonne created_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projets_services_b2b' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN created_by uuid DEFAULT auth.uid();
  END IF;
END $$;

-- Activation de RLS (Row Level Security)
ALTER TABLE projets_services_b2b ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
DROP POLICY IF EXISTS "projets_services_b2b_public_read" ON projets_services_b2b;
CREATE POLICY "projets_services_b2b_public_read"
  ON projets_services_b2b
  FOR SELECT
  TO public
  USING (true);

-- Politique pour permettre l'insertion publique (formulaires anonymes)
DROP POLICY IF EXISTS "projets_services_b2b_public_insert" ON projets_services_b2b;
CREATE POLICY "projets_services_b2b_public_insert"
  ON projets_services_b2b
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Politique pour permettre la modification par le créateur
DROP POLICY IF EXISTS "projets_services_b2b_owner_update" ON projets_services_b2b;
CREATE POLICY "projets_services_b2b_owner_update"
  ON projets_services_b2b
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Politique pour permettre la suppression par le créateur
DROP POLICY IF EXISTS "projets_services_b2b_owner_delete" ON projets_services_b2b;
CREATE POLICY "projets_services_b2b_owner_delete"
  ON projets_services_b2b
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());