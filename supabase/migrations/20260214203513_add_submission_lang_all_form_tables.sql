/*
  # Ajout colonne submission_lang à toutes les tables de formulaires

  1. Modifications
    - Ajoute la colonne `submission_lang` (TEXT, DEFAULT 'fr') aux tables suivantes :
      - partner_requests
      - suggestions_entreprises
      - demande_devis
      - evenements_scolaire
      - inquiries
      - candidates
      - job_postings
      - avis_entreprise
      - projets_services_b2b
      - evenements_locaux
      - evenements_culturels

  2. Notes
    - Cette colonne permet de tracer la langue dans laquelle chaque formulaire a été soumis
    - Valeurs possibles: 'fr', 'en', 'it', 'ru', 'ar'
    - Utilisée pour WhaleSync et synchronisation Airtable
    - Permet des analyses multilingues et du support ciblé
*/

DO $$
BEGIN
  -- partner_requests
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_requests' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE partner_requests ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- suggestions_entreprises
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suggestions_entreprises' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE suggestions_entreprises ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- demande_devis
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demande_devis' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE demande_devis ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- evenements_scolaire
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evenements_scolaire' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE evenements_scolaire ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- inquiries
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE inquiries ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- candidates
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE candidates ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- job_postings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- avis_entreprise
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avis_entreprise' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE avis_entreprise ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- projets_services_b2b
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projets_services_b2b' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE projets_services_b2b ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- evenements_locaux
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evenements_locaux' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE evenements_locaux ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

  -- evenements_culturels
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evenements_culturels' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE evenements_culturels ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;

END $$;
