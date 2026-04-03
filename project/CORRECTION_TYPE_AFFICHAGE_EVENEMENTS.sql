/*
  # Correction des types d'affichage pour les événements

  Ce script assigne des types d'affichage (hebdo, mensuel, annuel)
  aux événements existants pour que les cartes Premium s'affichent.

  Types d'affichage :
  - 'hebdo' : Événements de cette semaine (carte cyan)
  - 'mensuel' : Événements de ce mois (carte verte)
  - 'annuel' : Grands événements annuels (carte dorée)
*/

-- Événement hebdomadaire : Visite du Musée du Bardo (proche dans le temps)
UPDATE evenements_locaux
SET type_affichage = 'hebdo'
WHERE titre = 'Visite du Musée du Bardo'
  AND localisation_ville = 'Tunis';

-- Événement mensuel : Dégustation de Couscous (dans le mois)
UPDATE evenements_locaux
SET type_affichage = 'mensuel'
WHERE titre = 'Dégustation de Couscous Traditionnel'
  AND localisation_ville = 'Tunis';

-- Événement annuel : Festival de Jazz (grand événement prestigieux)
UPDATE evenements_locaux
SET type_affichage = 'annuel'
WHERE titre = 'Festival de Jazz de Carthage'
  AND localisation_ville = 'Carthage';

-- Vérification des résultats
SELECT
  type_affichage,
  titre,
  localisation_ville,
  date_debut,
  secteur_evenement
FROM evenements_locaux
WHERE type_affichage IS NOT NULL
ORDER BY type_affichage, date_debut;
