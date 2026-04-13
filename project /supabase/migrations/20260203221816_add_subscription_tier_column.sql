/*
  # Ajout de la colonne subscription_tier à la table entreprise
  
  1. Nouvelle colonne
    - `subscription_tier` (text) - Palier d'abonnement de l'entreprise
      Valeurs possibles: 'gratuit', 'decouverte', 'artisan', 'premium', 'elite', 'elite_pro', 'custom'
      Valeur par défaut: 'gratuit'
  
  2. Index
    - Index sur subscription_tier pour améliorer les performances
  
  3. Contraintes
    - Validation des valeurs autorisées
*/

-- Ajouter la colonne subscription_tier si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE entreprise
    ADD COLUMN subscription_tier TEXT DEFAULT 'gratuit';
  END IF;
END $$;

-- Mettre à jour les entreprises existantes sans tier
UPDATE entreprise 
SET subscription_tier = 'gratuit' 
WHERE subscription_tier IS NULL;

-- Créer un index sur subscription_tier pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_entreprise_subscription_tier ON entreprise(subscription_tier);

-- Ajouter une contrainte de validation pour les valeurs autorisées
DO $$
BEGIN
  ALTER TABLE entreprise
  DROP CONSTRAINT IF EXISTS entreprise_subscription_tier_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE entreprise
ADD CONSTRAINT entreprise_subscription_tier_check
CHECK (subscription_tier IN ('gratuit', 'decouverte', 'artisan', 'premium', 'elite', 'elite_pro', 'custom', 'personnalise', 'sur_mesure'));

-- Commentaire sur la colonne
COMMENT ON COLUMN entreprise.subscription_tier IS 'Palier d''abonnement: gratuit, decouverte, artisan, premium, elite, elite_pro, custom';
