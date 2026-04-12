/*
  # Ajout de la colonne secteur à la table entreprise
  
  1. Modifications
    - Ajout de la colonne `secteur` (text) à la table `entreprise`
    - Mise à jour des établissements éducatifs existants (categorie = 'Éducation') 
      pour définir secteur = 'education'
  
  2. Notes
    - La colonne secteur permettra de filtrer par type d'activité (education, sante, magasin, etc.)
    - Valeurs possibles : 'education', 'sante', 'magasin', 'restauration', 'culture', etc.
*/

-- Ajout de la colonne secteur
ALTER TABLE entreprise 
ADD COLUMN IF NOT EXISTS secteur text;

-- Mise à jour des établissements existants selon leur catégorie
UPDATE entreprise 
SET secteur = 'education' 
WHERE categorie = 'Éducation';

UPDATE entreprise 
SET secteur = 'sante' 
WHERE categorie = 'Santé';

UPDATE entreprise 
SET secteur = 'alimentation' 
WHERE categorie = 'Alimentation';

UPDATE entreprise 
SET secteur = 'culture' 
WHERE categorie = 'Culture';

UPDATE entreprise 
SET secteur = 'restauration' 
WHERE categorie = 'Restaurant';

UPDATE entreprise 
SET secteur = 'immobilier' 
WHERE categorie = 'Immobilier';

UPDATE entreprise 
SET secteur = 'beaute' 
WHERE categorie = 'Coiffure';

-- Index pour optimiser les recherches par secteur
CREATE INDEX IF NOT EXISTS idx_entreprise_secteur ON entreprise(secteur);
