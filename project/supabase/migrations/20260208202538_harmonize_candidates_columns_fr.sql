/*
  # Harmonisation de la table candidates en français

  ## Objectif
  Ajouter les colonnes françaises manquantes et migrer les données des colonnes anglaises
  pour avoir une cohérence avec la table job_postings.

  ## Modifications

  ### 1. Colonnes à ajouter (français)
  - `nom_complet` (text) - Nom complet du candidat (alias de full_name)
  - `ville_residence` (text) - Ville de résidence (alias de city)
  - `competences` (text[]) - Compétences (alias de skills)
  - `annees_experience` (integer) - Années d'expérience (alias de experience_years)
  - `contrats_souhaites` (text[]) - Contrats souhaités (alias de desired_contracts)
  - `adresse` (text) - Adresse complète (alias de address)
  - `est_premium` (boolean) - Profil premium (alias de is_premium)
  - `email` (text) - Email du candidat
  - `telephone` (text) - Téléphone du candidat

  ### 2. Migration des données
  Migrer les données des colonnes anglaises vers les colonnes françaises avant suppression.

  ## Sécurité
  Les politiques RLS existantes restent inchangées.
*/

-- Étape 1: Créer les colonnes françaises manquantes

-- nom_complet (alias de full_name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'nom_complet'
  ) THEN
    ALTER TABLE candidates ADD COLUMN nom_complet TEXT;
  END IF;
END $$;

-- ville_residence (alias de city)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'ville_residence'
  ) THEN
    ALTER TABLE candidates ADD COLUMN ville_residence TEXT;
  END IF;
END $$;

-- competences (alias de skills)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'competences'
  ) THEN
    ALTER TABLE candidates ADD COLUMN competences text[] DEFAULT '{}';
  END IF;
END $$;

-- annees_experience (alias de experience_years)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'annees_experience'
  ) THEN
    ALTER TABLE candidates ADD COLUMN annees_experience INTEGER DEFAULT 0;
  END IF;
END $$;

-- contrats_souhaites (alias de desired_contracts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'contrats_souhaites'
  ) THEN
    ALTER TABLE candidates ADD COLUMN contrats_souhaites text[] DEFAULT '{}';
  END IF;
END $$;

-- adresse (alias de address)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adresse'
  ) THEN
    ALTER TABLE candidates ADD COLUMN adresse TEXT;
  END IF;
END $$;

-- est_premium (alias de is_premium)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'est_premium'
  ) THEN
    ALTER TABLE candidates ADD COLUMN est_premium BOOLEAN DEFAULT false;
  END IF;
END $$;

-- email (nouvelle colonne)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'email'
  ) THEN
    ALTER TABLE candidates ADD COLUMN email TEXT;
  END IF;
END $$;

-- telephone (nouvelle colonne)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'telephone'
  ) THEN
    ALTER TABLE candidates ADD COLUMN telephone TEXT;
  END IF;
END $$;

-- Étape 2: Migrer les données des colonnes anglaises vers les colonnes françaises

-- Migrer full_name -> nom_complet
UPDATE candidates
SET nom_complet = COALESCE(nom_complet, full_name)
WHERE full_name IS NOT NULL AND (nom_complet IS NULL OR nom_complet = '');

-- Migrer city -> ville_residence
UPDATE candidates
SET ville_residence = COALESCE(ville_residence, city)
WHERE city IS NOT NULL AND (ville_residence IS NULL OR ville_residence = '');

-- Migrer skills -> competences
UPDATE candidates
SET competences = COALESCE(
  CASE
    WHEN competences IS NULL OR array_length(competences, 1) IS NULL
    THEN skills
    ELSE competences
  END,
  '{}'::text[]
)
WHERE skills IS NOT NULL AND array_length(skills, 1) > 0;

-- Migrer experience_years -> annees_experience
UPDATE candidates
SET annees_experience = COALESCE(annees_experience, experience_years, 0)
WHERE experience_years IS NOT NULL AND annees_experience IS NULL;

-- Migrer desired_contracts -> contrats_souhaites
UPDATE candidates
SET contrats_souhaites = COALESCE(
  CASE
    WHEN contrats_souhaites IS NULL OR array_length(contrats_souhaites, 1) IS NULL
    THEN desired_contracts
    ELSE contrats_souhaites
  END,
  '{}'::text[]
)
WHERE desired_contracts IS NOT NULL AND array_length(desired_contracts, 1) > 0;

-- Migrer address -> adresse
UPDATE candidates
SET adresse = COALESCE(adresse, address)
WHERE address IS NOT NULL AND (adresse IS NULL OR adresse = '');

-- Migrer is_premium -> est_premium
UPDATE candidates
SET est_premium = COALESCE(est_premium, is_premium, false);

-- Étape 3: Définir les valeurs par défaut et contraintes

-- Assurer que est_premium a une valeur par défaut
ALTER TABLE candidates ALTER COLUMN est_premium SET DEFAULT false;

-- Mettre NULL à false pour est_premium
UPDATE candidates SET est_premium = false WHERE est_premium IS NULL;
ALTER TABLE candidates ALTER COLUMN est_premium SET NOT NULL;

-- Assurer que competences a une valeur par défaut
ALTER TABLE candidates ALTER COLUMN competences SET DEFAULT '{}'::text[];

-- Assurer que contrats_souhaites a une valeur par défaut
ALTER TABLE candidates ALTER COLUMN contrats_souhaites SET DEFAULT '{}'::text[];

-- Assurer que annees_experience a une valeur par défaut
ALTER TABLE candidates ALTER COLUMN annees_experience SET DEFAULT 0;

-- Mettre NULL à 0 pour annees_experience
UPDATE candidates SET annees_experience = 0 WHERE annees_experience IS NULL;

-- Étape 4: Créer des index pour les nouvelles colonnes

CREATE INDEX IF NOT EXISTS idx_candidates_ville_residence ON candidates(ville_residence);
CREATE INDEX IF NOT EXISTS idx_candidates_est_premium ON candidates(est_premium) WHERE est_premium = true;
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Étape 5: Ajouter des commentaires explicatifs

COMMENT ON COLUMN candidates.nom_complet IS 'Nom complet du candidat';
COMMENT ON COLUMN candidates.ville_residence IS 'Ville de résidence du candidat';
COMMENT ON COLUMN candidates.competences IS 'Compétences du candidat (array)';
COMMENT ON COLUMN candidates.annees_experience IS 'Années d''expérience professionnelle';
COMMENT ON COLUMN candidates.contrats_souhaites IS 'Types de contrats souhaités (CDI, CDD, etc.)';
COMMENT ON COLUMN candidates.adresse IS 'Adresse complète du candidat';
COMMENT ON COLUMN candidates.est_premium IS 'Profil premium avec badge doré';
COMMENT ON COLUMN candidates.email IS 'Adresse email du candidat';
COMMENT ON COLUMN candidates.telephone IS 'Numéro de téléphone du candidat';
