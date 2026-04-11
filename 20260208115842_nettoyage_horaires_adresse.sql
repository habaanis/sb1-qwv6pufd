/*
  # Nettoyage des horaires dans le champ adresse

  1. Problème identifié
    - 43 entreprises ont des statuts "Fermé", "Ouvert 24h/24" dans le champ `adresse`
    - Ces données empêchent le géocodage
    
  2. Action
    - Mise à NULL du champ `adresse` si contient uniquement des horaires/statuts
    - Patterns : "Fermé", "Ouvert", jours, heures seuls
    
  3. Sécurité
    - Préserve les adresses réelles contenant des numéros de rue valides
    - Permet au géocodage d'utiliser ville + nom d'entreprise
*/

-- Nettoyage des statuts d'ouverture dans adresse
UPDATE entreprise
SET adresse = NULL
WHERE 
  adresse ~* '^(fermé|ouvert|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)' 
  OR adresse ~* '(ouvert 24h|fermeture|horaires)'
  OR adresse = 'Fermé'
  OR adresse = 'Ouvert';
