/*
  # Renommer langue_soumission en submission_lang

  1. Modification
    - Renomme la colonne `langue_soumission` en `submission_lang` dans la table `inscriptions_loisirs`
    - Standardise le nom pour correspondre aux conventions i18n

  2. Notes
    - Cette colonne permet de tracer la langue dans laquelle le formulaire a été soumis
    - Valeurs possibles: 'fr', 'en', 'ar', 'it', 'ru'
*/

DO $$
BEGIN
  -- Vérifie si langue_soumission existe et renomme en submission_lang
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inscriptions_loisirs' AND column_name = 'langue_soumission'
  ) THEN
    ALTER TABLE inscriptions_loisirs RENAME COLUMN langue_soumission TO submission_lang;
  END IF;

  -- Si submission_lang n'existe pas encore, créer la colonne
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inscriptions_loisirs' AND column_name = 'submission_lang'
  ) THEN
    ALTER TABLE inscriptions_loisirs ADD COLUMN submission_lang TEXT DEFAULT 'fr';
  END IF;
END $$;
