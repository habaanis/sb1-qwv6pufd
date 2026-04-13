/*
  # Ajout du champ Premium aux entreprises

  1. Modifications
    - Ajout de la colonne `is_premium` (boolean) à la table `entreprise`
    - Valeur par défaut : false
    - Index créé pour optimiser les recherches par statut premium
  
  2. Notes
    - Ce champ permet de marquer les entreprises ayant un abonnement premium
    - Les entreprises premium seront priorisées dans les affichages
    - La colonne est nullable pour la compatibilité avec les données existantes
*/

-- Ajouter la colonne is_premium si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN is_premium boolean DEFAULT false;
  END IF;
END $$;

-- Créer un index pour optimiser les requêtes premium
CREATE INDEX IF NOT EXISTS idx_entreprise_is_premium ON entreprise(is_premium) WHERE is_premium = true;

-- Créer un index composite pour les requêtes par catégorie et premium
CREATE INDEX IF NOT EXISTS idx_entreprise_categorie_premium ON entreprise(categorie, is_premium);
