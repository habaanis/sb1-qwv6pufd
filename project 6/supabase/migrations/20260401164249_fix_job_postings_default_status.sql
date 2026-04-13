/*
  # Correction du statut par défaut de job_postings

  1. Problème identifié
    - Le statut par défaut est 'Brouillon' mais la contrainte CHECK n'accepte que 'active' ou 'closed'
    - Cela empêche les insertions depuis le formulaire

  2. Solution
    - Changer le statut par défaut de 'Brouillon' à 'active'
    - S'assurer que toutes les offres existantes ont un statut valide

  3. Sécurité
    - Pas de changement aux politiques RLS
*/

-- Étape 1: Mettre à jour toutes les offres avec un statut invalide
UPDATE job_postings 
SET statut = 'active'
WHERE statut NOT IN ('active', 'closed') OR statut IS NULL;

-- Étape 2: Changer le statut par défaut de la colonne
ALTER TABLE job_postings 
ALTER COLUMN statut SET DEFAULT 'active';

-- Vérification: Afficher le nouveau statut par défaut
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'job_postings' AND column_name = 'statut';
