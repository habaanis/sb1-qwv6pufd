/*
  # Harmonisation de la table job_postings en français (Version 2)

  ## Objectif
  Nettoyer et harmoniser la table job_postings en gardant uniquement les colonnes en français
  et en supprimant les doublons de colonnes anglaises.

  ## Modifications

  ### 1. Colonnes à conserver (français)
  - `id` (uuid) - Identifiant unique
  - `titre_poste` (text) - Titre du poste
  - `nom_entreprise` (text) - Nom de l'entreprise
  - `adresse_entreprise` (text) - Adresse complète de l'entreprise
  - `ville` (text) - Ville du poste
  - `secteur_emploi` (text) - Secteur d'activité
  - `type_contrat` (text) - Type de contrat (CDI, CDD, etc.)
  - `niveau_experience` (text) - Niveau d'expérience requis
  - `competences_cles` (text[]) - Compétences clés requises (array)
  - `description_poste` (text) - Description du poste
  - `exigences_profil` (text) - Exigences et qualifications
  - `salaire_min` (numeric) - Salaire minimum
  - `salaire_max` (numeric) - Salaire maximum
  - `email_contact` (text) - Email de contact
  - `telephone_contact` (text) - Téléphone de contact
  - `statut` (text) - Statut de l'offre (active, closed)
  - `est_premium` (boolean) - Offre premium ou non
  - `created_by` (uuid) - Créateur de l'offre
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de mise à jour

  ### 2. Colonnes à supprimer (doublons anglais)
  - `company`, `category`, `city`, `contact_phone`, `company_address`
  - `salary_min`, `salary_max`, `is_premium`, `is_premium_ad`
  - `skills`, `seniority`, `requirements`, `salary_range`
  - `description_text`, `contract_type`, `type`, `status`
  - `entreprise_id` (non utilisé)

  ### 3. Migration des données
  Avant de supprimer les colonnes anglaises, migrer les données vers les colonnes françaises.

  ## Sécurité
  Les politiques RLS sont mises à jour pour permettre les insertions anonymes.
*/

-- Étape 1: Créer les colonnes françaises manquantes

-- adresse_entreprise
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'adresse_entreprise'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN adresse_entreprise TEXT;
  END IF;
END $$;

-- Étape 2: Migrer les données des colonnes anglaises vers les colonnes françaises

-- Migrer company_address -> adresse_entreprise
UPDATE job_postings 
SET adresse_entreprise = COALESCE(adresse_entreprise, company_address)
WHERE company_address IS NOT NULL AND (adresse_entreprise IS NULL OR adresse_entreprise = '');

-- Migrer company -> nom_entreprise
UPDATE job_postings 
SET nom_entreprise = COALESCE(nom_entreprise, company)
WHERE company IS NOT NULL AND (nom_entreprise IS NULL OR nom_entreprise = '');

-- Migrer city -> ville
UPDATE job_postings 
SET ville = COALESCE(ville, city)
WHERE city IS NOT NULL AND (ville IS NULL OR ville = '');

-- Migrer category -> secteur_emploi
UPDATE job_postings 
SET secteur_emploi = COALESCE(secteur_emploi, category)
WHERE category IS NOT NULL AND (secteur_emploi IS NULL OR secteur_emploi = '');

-- Migrer contract_type -> type_contrat
UPDATE job_postings 
SET type_contrat = COALESCE(type_contrat, contract_type)
WHERE contract_type IS NOT NULL AND (type_contrat IS NULL OR type_contrat = '');

-- Migrer seniority -> niveau_experience
UPDATE job_postings 
SET niveau_experience = COALESCE(niveau_experience, seniority)
WHERE seniority IS NOT NULL AND (niveau_experience IS NULL OR niveau_experience = '');

-- Migrer skills -> competences_cles (si skills est un array et competences_cles est text)
DO $$
BEGIN
  -- Si competences_cles est text, le convertir en array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' 
    AND column_name = 'competences_cles' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE job_postings ALTER COLUMN competences_cles TYPE text[] USING 
      CASE 
        WHEN competences_cles IS NOT NULL AND competences_cles != '' 
        THEN string_to_array(competences_cles, ',')
        ELSE '{}'::text[]
      END;
  END IF;
END $$;

-- Migrer skills vers competences_cles
UPDATE job_postings 
SET competences_cles = COALESCE(
  CASE 
    WHEN competences_cles IS NULL OR array_length(competences_cles, 1) IS NULL 
    THEN skills 
    ELSE competences_cles 
  END,
  '{}'::text[]
)
WHERE skills IS NOT NULL AND array_length(skills, 1) > 0;

-- Migrer requirements -> exigences_profil
UPDATE job_postings 
SET exigences_profil = COALESCE(exigences_profil, requirements)
WHERE requirements IS NOT NULL AND (exigences_profil IS NULL OR exigences_profil = '');

-- Migrer is_premium -> est_premium
UPDATE job_postings 
SET est_premium = COALESCE(est_premium, is_premium, is_premium_ad, false);

-- Migrer contact_phone -> telephone_contact
UPDATE job_postings 
SET telephone_contact = COALESCE(telephone_contact, contact_phone)
WHERE contact_phone IS NOT NULL AND (telephone_contact IS NULL OR telephone_contact = '');

-- Nettoyer et migrer status -> statut
-- Transformer les valeurs invalides en 'active'
UPDATE job_postings 
SET statut = CASE 
  WHEN LOWER(COALESCE(statut, status, '')) IN ('active', 'actif', 'open', 'ouvert') THEN 'active'
  WHEN LOWER(COALESCE(statut, status, '')) IN ('closed', 'fermé', 'expired', 'expiré') THEN 'closed'
  ELSE 'active'
END
WHERE statut IS NULL OR statut NOT IN ('active', 'closed');

-- Migrer les salaires
UPDATE job_postings 
SET salaire_min = COALESCE(salaire_min, salary_min)
WHERE salary_min IS NOT NULL AND salaire_min IS NULL;

UPDATE job_postings 
SET salaire_max = COALESCE(salaire_max, salary_max)
WHERE salary_max IS NOT NULL AND salaire_max IS NULL;

-- Étape 3: Supprimer les colonnes anglaises (doublons)

ALTER TABLE job_postings DROP COLUMN IF EXISTS company CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS category CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS city CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS contact_phone CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS company_address CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS salary_min CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS salary_max CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS is_premium CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS is_premium_ad CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS skills CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS seniority CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS requirements CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS salary_range CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS description_text CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS contract_type CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS type CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS status CASCADE;
ALTER TABLE job_postings DROP COLUMN IF EXISTS entreprise_id CASCADE;

-- Étape 4: Définir les valeurs par défaut et contraintes

-- Assurer que est_premium a une valeur par défaut
ALTER TABLE job_postings ALTER COLUMN est_premium SET DEFAULT false;

-- Mettre NULL à false pour est_premium
UPDATE job_postings SET est_premium = false WHERE est_premium IS NULL;
ALTER TABLE job_postings ALTER COLUMN est_premium SET NOT NULL;

-- Assurer que competences_cles a une valeur par défaut
ALTER TABLE job_postings ALTER COLUMN competences_cles SET DEFAULT '{}'::text[];

-- Assurer que statut a une contrainte
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_statut_check;
  ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_status_check;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE job_postings ADD CONSTRAINT job_postings_statut_check 
    CHECK (statut IN ('active', 'closed'));
END $$;

-- Assurer que type_contrat a une contrainte
DO $$
BEGIN
  ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_type_contrat_check;
  ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_type_check;
  ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_contract_type_check;
  
  ALTER TABLE job_postings ADD CONSTRAINT job_postings_type_contrat_check 
    CHECK (type_contrat IN ('CDI', 'CDD', 'Intérim', 'Stage', 'Freelance', 'CIVP'));
END $$;

-- Assurer que niveau_experience a une contrainte
DO $$
BEGIN
  ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_niveau_experience_check;
  ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_seniority_check;
  
  ALTER TABLE job_postings ADD CONSTRAINT job_postings_niveau_experience_check 
    CHECK (niveau_experience IN ('junior', 'mid', 'senior', 'all'));
END $$;

-- Étape 5: Recréer les index sur les nouvelles colonnes

DROP INDEX IF EXISTS idx_job_postings_category;
DROP INDEX IF EXISTS idx_job_postings_city;
DROP INDEX IF EXISTS idx_job_postings_status;
DROP INDEX IF EXISTS idx_job_postings_is_premium;

CREATE INDEX IF NOT EXISTS idx_job_postings_secteur_emploi ON job_postings(secteur_emploi);
CREATE INDEX IF NOT EXISTS idx_job_postings_ville ON job_postings(ville);
CREATE INDEX IF NOT EXISTS idx_job_postings_statut ON job_postings(statut);
CREATE INDEX IF NOT EXISTS idx_job_postings_est_premium ON job_postings(est_premium) WHERE est_premium = true;
CREATE INDEX IF NOT EXISTS idx_job_postings_type_contrat ON job_postings(type_contrat);

-- Étape 6: Mettre à jour les politiques RLS

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Anyone can view active job postings" ON job_postings;
DROP POLICY IF EXISTS "Authenticated users can insert job postings" ON job_postings;
DROP POLICY IF EXISTS "Authenticated users can update job postings" ON job_postings;
DROP POLICY IF EXISTS "Users can view own job postings" ON job_postings;
DROP POLICY IF EXISTS "Users can insert own job postings" ON job_postings;
DROP POLICY IF EXISTS "Users can update own job postings" ON job_postings;
DROP POLICY IF EXISTS "Users can delete own job postings" ON job_postings;
DROP POLICY IF EXISTS "Anonymous users can insert job postings" ON job_postings;

-- Créer les nouvelles politiques avec les colonnes françaises

-- Lecture publique des offres actives
CREATE POLICY "Lecture publique des offres actives"
  ON job_postings
  FOR SELECT
  TO anon, authenticated
  USING (statut = 'active');

-- Les utilisateurs authentifiés peuvent voir leurs propres offres
CREATE POLICY "Utilisateurs voient leurs offres"
  ON job_postings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Permettre les insertions anonymes et authentifiées
CREATE POLICY "Insertion publique des offres"
  ON job_postings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Mise à jour par le créateur uniquement
CREATE POLICY "Mise à jour par créateur"
  ON job_postings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Suppression par le créateur uniquement
CREATE POLICY "Suppression par créateur"
  ON job_postings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
