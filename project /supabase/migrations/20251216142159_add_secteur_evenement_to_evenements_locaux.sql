/*
  # Ajout de la colonne secteur_evenement à la table evenements_locaux

  1. Modifications
    - Ajout de la colonne `secteur_evenement` à `evenements_locaux`
      - Type: text
      - Valeurs possibles: 'loisir', 'education', 'entreprise'
      - Valeur par défaut: 'loisir' (car cette table est principalement pour les évènements loisirs)
      - Nullable: false

  2. Index
    - Ajout d'un index sur `secteur_evenement` pour faciliter les requêtes filtrées

  3. Notes
    - Cette colonne permet de catégoriser les évènements par secteur
    - Les évènements existants seront automatiquement marqués comme 'loisir'
    - Cette approche permet de réutiliser la même table pour différents types d'évènements
*/

-- Ajout de la colonne secteur_evenement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'evenements_locaux'
    AND column_name = 'secteur_evenement'
  ) THEN
    ALTER TABLE evenements_locaux
    ADD COLUMN secteur_evenement text NOT NULL DEFAULT 'loisir'
    CHECK (secteur_evenement IN ('loisir', 'education', 'entreprise'));
  END IF;
END $$;

-- Ajout d'un index sur secteur_evenement
CREATE INDEX IF NOT EXISTS idx_evenements_locaux_secteur ON evenements_locaux(secteur_evenement);

-- Commentaire pour la documentation
COMMENT ON COLUMN evenements_locaux.secteur_evenement IS 'Secteur de l''évènement: loisir, education, ou entreprise';
