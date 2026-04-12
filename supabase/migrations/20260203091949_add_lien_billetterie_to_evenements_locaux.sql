/*
  # Ajout de la colonne lien_billetterie à evenements_locaux

  ## Modifications
  
  1. Nouvelle colonne
    - `lien_billetterie` (text) - URL vers la page de billetterie/réservation
    
  ## Notes
  - Cette colonne permet aux événements d'avoir un lien direct vers l'achat de billets
  - Le bouton "Réserver/Billetterie" s'affichera uniquement si ce champ est rempli
*/

-- Ajouter la colonne lien_billetterie si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evenements_locaux' 
    AND column_name = 'lien_billetterie'
  ) THEN
    ALTER TABLE evenements_locaux 
    ADD COLUMN lien_billetterie text;
  END IF;
END $$;

-- Mettre à jour quelques événements d'exemple avec des liens de billetterie
UPDATE evenements_locaux 
SET lien_billetterie = 'https://example.com/tickets/jazz-carthage'
WHERE titre ILIKE '%jazz%carthage%';

UPDATE evenements_locaux 
SET lien_billetterie = 'https://example.com/tickets/festival-mahdia'
WHERE titre ILIKE '%festival%mahdia%';

UPDATE evenements_locaux 
SET lien_billetterie = 'https://example.com/tickets/marathon-monastir'
WHERE titre ILIKE '%marathon%monastir%';
