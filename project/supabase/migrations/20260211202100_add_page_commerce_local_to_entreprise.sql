/*
  # Ajout de la colonne page_commerce_local à la table entreprise

  ## Description
  Remplace la logique de validation is_local_verified par une colonne spécifique
  pour contrôler l'affichage sur la page "Commerces & Magasins".

  ## Changements
  1. Nouvelles Colonnes
    - `page_commerce_local` (boolean, défaut: false)
      Contrôle si l'établissement apparaît sur la page Commerce Local

  ## Notes
  - La colonne existante is_local_verified reste en place pour d'autres usages
  - Par défaut, les nouveaux établissements ne sont pas affichés (false)
  - Les administrateurs peuvent cocher cette option pour valider l'affichage
*/

-- Ajouter la colonne page_commerce_local si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'page_commerce_local'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN page_commerce_local boolean DEFAULT false;
    
    -- Créer un index pour améliorer les performances des requêtes filtrées
    CREATE INDEX IF NOT EXISTS idx_entreprise_page_commerce_local 
    ON entreprise(page_commerce_local) 
    WHERE page_commerce_local = true;
    
    -- Index composite pour les recherches sur la page Commerces
    CREATE INDEX IF NOT EXISTS idx_entreprise_commerce_secteur 
    ON entreprise(secteur, page_commerce_local) 
    WHERE secteur = 'magasin' AND page_commerce_local = true;
  END IF;
END $$;