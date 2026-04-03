/*
  # Ajout colonne is_local_verified à la table entreprise

  1. Modifications
    - Ajout de la colonne `is_local_verified` (boolean, défaut: false) à la table `entreprise`
    - Cette colonne permet d'identifier les commerces vérifiés localement
    - Mise à jour de l'index existant si nécessaire

  2. Notes
    - Par défaut, tous les établissements ont `is_local_verified = false`
    - Les commerces doivent être vérifiés manuellement pour passer à `true`
    - Utilisé pour filtrer les résultats dans la page Commerces & Magasins
*/

-- Ajout de la colonne is_local_verified si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'is_local_verified'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN is_local_verified boolean DEFAULT false;
  END IF;
END $$;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_entreprise_is_local_verified ON entreprise(is_local_verified) WHERE is_local_verified = true;