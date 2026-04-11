/*
  # Ajout des colonnes est_annuel et description_courte à evenements_locaux

  ## Modifications
  
  1. Nouvelles colonnes
    - `est_annuel` (boolean) - Indique si l'événement est annuel/récurrent
    - `description_courte` (text) - Description courte pour affichage rapide
    
  2. Migration des données
    - Copie de `description` vers `description_courte` (tronqué à 150 caractères)
    - `est_annuel` par défaut à false
    
  ## Notes
  - Les événements annuels seront affichés dans le cadre "Événements Annuels"
  - La description courte améliore la performance d'affichage des cartes
*/

-- Ajouter la colonne est_annuel
ALTER TABLE evenements_locaux 
ADD COLUMN IF NOT EXISTS est_annuel boolean DEFAULT false;

-- Ajouter la colonne description_courte
ALTER TABLE evenements_locaux 
ADD COLUMN IF NOT EXISTS description_courte text;

-- Migrer les descriptions existantes vers description_courte (tronquées à 150 caractères)
UPDATE evenements_locaux 
SET description_courte = CASE 
  WHEN LENGTH(description) > 150 
  THEN SUBSTRING(description, 1, 147) || '...'
  ELSE description 
END
WHERE description_courte IS NULL;

-- Créer un index sur est_annuel pour les filtres
CREATE INDEX IF NOT EXISTS idx_evenements_est_annuel 
ON evenements_locaux(est_annuel);

-- Mettre à jour quelques événements d'exemple comme annuels
UPDATE evenements_locaux 
SET est_annuel = true 
WHERE titre IN (
  'Festival International de Mahdia',
  'Marathon de Monastir'
);
