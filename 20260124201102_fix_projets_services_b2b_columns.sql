/*
  # Correction des colonnes manquantes dans projets_services_b2b

  1. Modifications
    - Ajout de la colonne `description` (text) - utilisée par le formulaire
    - Ajout de la colonne `localisation` (text) - utilisée par le formulaire
    
  2. Notes
    - La table a `description_detaillee` mais le formulaire envoie `description`
    - La table a `localisation_service` mais le formulaire envoie `localisation`
    - On ajoute les colonnes manquantes pour assurer la compatibilité
*/

-- Ajout de la colonne description (utilisée par le formulaire)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projets_services_b2b'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN description text;
  END IF;
END $$;

-- Ajout de la colonne localisation (utilisée par le formulaire)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projets_services_b2b'
    AND column_name = 'localisation'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN localisation text;
  END IF;
END $$;

-- Commentaires pour documentation
COMMENT ON COLUMN projets_services_b2b.description IS 'Description courte du service (utilisée par le formulaire Proposer mes services)';
COMMENT ON COLUMN projets_services_b2b.localisation IS 'Localisation/Ville du service (utilisée par le formulaire Proposer mes services)';
