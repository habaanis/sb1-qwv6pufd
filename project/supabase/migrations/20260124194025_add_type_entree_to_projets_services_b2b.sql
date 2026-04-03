/*
  # Ajout de la colonne type_entree à projets_services_b2b

  1. Modifications
    - Ajout de la colonne `type_entree` (text) pour distinguer offres et demandes
    - Valeurs possibles : 'offre_service', 'demande_service'
    - Default: 'demande_service'
    - Ajout de nouveaux champs pour les offres de services :
      - `secteur_activite` (text) - Secteur d'activité
      - `annees_experience` (integer) - Années d'expérience
      - `site_web` (text) - Site web ou portfolio

  2. Index
    - Index sur type_entree pour filtrage rapide

  3. Notes
    - Les offres de services utiliseront type_entree = 'offre_service'
    - Les demandes utiliseront type_entree = 'demande_service'
*/

-- Ajout de la colonne type_entree
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projets_services_b2b'
    AND column_name = 'type_entree'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN type_entree text DEFAULT 'demande_service';
  END IF;
END $$;

-- Ajout du constraint après l'ajout de la colonne
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'projets_services_b2b_type_entree_check'
  ) THEN
    ALTER TABLE projets_services_b2b ADD CONSTRAINT projets_services_b2b_type_entree_check
    CHECK (type_entree IN ('offre_service', 'demande_service'));
  END IF;
END $$;

-- Ajout des colonnes pour les offres de services
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projets_services_b2b'
    AND column_name = 'secteur_activite'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN secteur_activite text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projets_services_b2b'
    AND column_name = 'annees_experience'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN annees_experience integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projets_services_b2b'
    AND column_name = 'site_web'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN site_web text;
  END IF;
END $$;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN projets_services_b2b.type_entree IS 'Type d''entrée: offre_service (proposer), demande_service (chercher)';
COMMENT ON COLUMN projets_services_b2b.secteur_activite IS 'Secteur d''activité pour les offres de services';
COMMENT ON COLUMN projets_services_b2b.annees_experience IS 'Années d''expérience pour les offres de services';
COMMENT ON COLUMN projets_services_b2b.site_web IS 'Site web ou portfolio pour les offres de services';

-- Créer un index pour filtrer rapidement par type
CREATE INDEX IF NOT EXISTS idx_projets_services_b2b_type_entree ON projets_services_b2b(type_entree);