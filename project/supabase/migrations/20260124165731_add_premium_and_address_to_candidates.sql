/*
  # Ajout colonne is_premium et address à la table candidates

  1. Modifications
    - Ajout de `is_premium` (boolean) - Indique si le candidat a un profil premium
    - Ajout de `address` (text) - Adresse complète du candidat
  
  2. Valeurs par défaut
    - `is_premium` DEFAULT false - Tous les profils sont standard par défaut
    - `address` nullable - Champ optionnel
  
  3. Sécurité
    - Aucune modification des policies RLS existantes nécessaire
*/

-- Ajout de la colonne is_premium si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE candidates ADD COLUMN is_premium BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Ajout de la colonne address si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'address'
  ) THEN
    ALTER TABLE candidates ADD COLUMN address TEXT;
  END IF;
END $$;

-- Index pour filtrer rapidement les profils premium
CREATE INDEX IF NOT EXISTS idx_candidates_is_premium ON candidates(is_premium) WHERE is_premium = true;
