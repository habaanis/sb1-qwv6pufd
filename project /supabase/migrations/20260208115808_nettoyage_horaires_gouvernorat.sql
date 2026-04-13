/*
  # Nettoyage des horaires dans le champ gouvernorat

  1. Problème identifié
    - 7 entreprises ont des horaires d'ouverture dans le champ `gouvernorat`
    - Ces données empêchent le géocodage précis
    
  2. Action
    - Mise à NULL du champ `gouvernorat` si contient des horaires
    - Patterns détectés : jours de semaine, heures, "ouvert", "fermé"
    
  3. Sécurité
    - Les données ville et adresse sont préservées
    - Permet au géocodage d'utiliser ville + adresse uniquement
*/

-- Nettoyage des horaires dans gouvernorat
UPDATE entreprise
SET gouvernorat = NULL
WHERE gouvernorat ~* '(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|h\d{1,2}|\d{1,2}:\d{2}|ouvert|fermé|fermeture)';
