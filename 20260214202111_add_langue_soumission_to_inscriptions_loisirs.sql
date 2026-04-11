/*
  # Ajout de la colonne langue_soumission aux inscriptions loisirs

  1. Modification
    - Ajout de la colonne `langue_soumission` de type TEXT à la table `inscriptions_loisirs`
    - Valeur par défaut: 'fr'
    - Permet de tracer la langue dans laquelle le formulaire a été soumis

  2. Notes
    - Cette colonne permet d'adapter les communications avec le soumissionnaire dans sa langue
    - Valeurs possibles: 'fr', 'en', 'ar', 'it', 'ru'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inscriptions_loisirs' AND column_name = 'langue_soumission'
  ) THEN
    ALTER TABLE inscriptions_loisirs ADD COLUMN langue_soumission TEXT DEFAULT 'fr';
  END IF;
END $$;
