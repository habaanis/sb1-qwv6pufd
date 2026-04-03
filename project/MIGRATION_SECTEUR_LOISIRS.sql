/*
  # Migration: Mise à jour du secteur Loisirs

  Cette migration met à jour toutes les occurrences de 'loisir' en 'Loisirs & Événements'
  dans les tables entreprise et evenements_locaux pour uniformiser les valeurs de secteur.

  ## Tables affectées
  1. `entreprise` - colonne `secteur`
  2. `evenements_locaux` - colonne `secteur_evenement`

  ## Changements
  - Remplace 'loisir' par 'Loisirs & Événements' dans toutes les entrées existantes
  - Assure la cohérence des données avec le frontend mis à jour
*/

-- ====================================================================
-- 1. Mise à jour de la table entreprise
-- ====================================================================

-- Mettre à jour tous les enregistrements ayant 'loisir' comme secteur
UPDATE entreprise
SET secteur = 'Loisirs & Événements'
WHERE secteur = 'loisir' OR secteur = 'Loisir';

-- Vérification: Afficher le nombre d'entreprises dans le secteur Loisirs
SELECT
  'entreprise' as table_name,
  secteur,
  COUNT(*) as count
FROM entreprise
WHERE secteur ILIKE '%loisir%'
GROUP BY secteur;

-- ====================================================================
-- 2. Mise à jour de la table evenements_locaux
-- ====================================================================

-- Mettre à jour tous les événements ayant 'loisir' comme secteur
UPDATE evenements_locaux
SET secteur_evenement = 'Loisirs & Événements'
WHERE secteur_evenement = 'loisir' OR secteur_evenement = 'Loisir';

-- Vérification: Afficher le nombre d'événements dans le secteur Loisirs
SELECT
  'evenements_locaux' as table_name,
  secteur_evenement,
  COUNT(*) as count
FROM evenements_locaux
WHERE secteur_evenement ILIKE '%loisir%'
GROUP BY secteur_evenement;

-- ====================================================================
-- 3. Mise à jour de la table featured_events (si elle existe)
-- ====================================================================

-- Mettre à jour les événements mis en avant
UPDATE featured_events
SET secteur_evenement = 'Loisirs & Événements'
WHERE secteur_evenement = 'loisir' OR secteur_evenement = 'Loisir';

-- ====================================================================
-- FIN DE LA MIGRATION
-- ====================================================================

-- Rapport final: Afficher les secteurs uniques dans chaque table
SELECT 'RAPPORT FINAL - entreprise' as info, secteur, COUNT(*) as count
FROM entreprise
GROUP BY secteur
ORDER BY secteur;

SELECT 'RAPPORT FINAL - evenements_locaux' as info, secteur_evenement, COUNT(*) as count
FROM evenements_locaux
GROUP BY secteur_evenement
ORDER BY secteur_evenement;
