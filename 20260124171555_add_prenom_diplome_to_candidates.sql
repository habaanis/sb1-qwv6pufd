/*
  # Ajouter prenom et diplome à la table candidates

  1. Modifications
    - Ajout de la colonne `prenom` (text) pour stocker le prénom séparément du nom
    - Ajout de la colonne `diplome` (text) pour stocker le niveau de diplôme (Licence, Master, Doctorat, etc.)
  
  2. Notes
    - `full_name` reste pour compatibilité avec l'existant
    - Les deux nouvelles colonnes sont optionnelles (nullable)
    - Permet une meilleure valorisation des profils Premium avec diplômes élevés
*/

-- Ajouter la colonne prenom si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'prenom'
  ) THEN
    ALTER TABLE candidates ADD COLUMN prenom text;
  END IF;
END $$;

-- Ajouter la colonne diplome si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'diplome'
  ) THEN
    ALTER TABLE candidates ADD COLUMN diplome text;
  END IF;
END $$;

-- Créer un index pour rechercher par diplome (utile pour filtrer les hauts diplômes)
CREATE INDEX IF NOT EXISTS idx_candidates_diplome ON candidates(diplome);

-- Créer un commentaire explicatif sur les colonnes
COMMENT ON COLUMN candidates.prenom IS 'Prénom du candidat (séparé du nom de famille)';
COMMENT ON COLUMN candidates.diplome IS 'Niveau de diplôme du candidat (ex: Licence, Master, Doctorat, Ingénieur, etc.)';
