/*
  # Ajout du compteur de vues aux entreprises

  1. Modifications
    - Ajout de la colonne `views_count` (integer, défaut 0) à la table `entreprise`
    - Cette colonne permet de compter le nombre de vues de la fiche entreprise
    - Incrémentation uniquement via le Dashboard Admin

  2. Sécurité
    - Lecture publique (SELECT) autorisée pour tous
    - Modification (UPDATE) uniquement via Admin/Backend
*/

-- Ajouter la colonne views_count si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN views_count integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Index pour performance (optionnel)
CREATE INDEX IF NOT EXISTS idx_entreprise_views_count ON entreprise(views_count DESC);

-- Commentaire sur la colonne
COMMENT ON COLUMN entreprise.views_count IS 'Nombre de vues de la fiche entreprise (incrémenté via Admin uniquement)';
