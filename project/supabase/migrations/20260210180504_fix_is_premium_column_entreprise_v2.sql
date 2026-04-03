/*
  # Correction : Ajout de la colonne is_premium à la table entreprise

  1. Ajout de colonne
    - Ajoute `is_premium` (boolean) à la table `entreprise`
    - Valeur par défaut : false
    - Permet de marquer les entreprises premium

  2. Index de performance
    - Index sur is_premium pour optimiser les recherches
    - Index composite categorie + is_premium

  3. Migration des données existantes
    - Synchronise avec "Statut Abonnement" si possible
    - Met à jour les entreprises ELITE et PREMIUM
*/

-- Ajouter la colonne is_premium
ALTER TABLE entreprise ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- Créer les index de performance
CREATE INDEX IF NOT EXISTS idx_entreprise_is_premium ON entreprise(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_entreprise_categorie_premium ON entreprise(categorie, is_premium);

-- Synchroniser avec "Statut Abonnement" existant (colonne avec espaces)
UPDATE entreprise 
SET is_premium = true 
WHERE "Statut Abonnement" IN ('ELITE', 'PREMIUM')
AND is_premium IS DISTINCT FROM true;