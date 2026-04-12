/*
  # Suppression de la contrainte CHECK sur secteur_evenement
  
  1. Modifications
    - Supprime la contrainte `culture_events_secteur_check` qui limite les valeurs de `secteur_evenement`
    - La colonne devient un champ text libre acceptant toutes les valeurs envoyées par Whalesync
    - Permet les valeurs exactes 'Art & Culture' et 'Sorties & Soirées' sans restriction
  
  2. Raison
    - Alignement total avec les données Whalesync
    - Support des valeurs avec accents et esperluette (&)
    - Flexibilité pour les futures catégories
*/

-- Supprimer la contrainte CHECK existante sur secteur_evenement
ALTER TABLE culture_events 
DROP CONSTRAINT IF EXISTS culture_events_secteur_check;
