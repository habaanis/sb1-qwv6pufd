/*
  # Changement du type de colonne services en TEXT

  1. Modifications
    - Convertir la colonne `services` de type ARRAY en TEXT
    - Permet de stocker du texte long avec retours à la ligne
    - Préserve les données existantes (tableaux vides convertis en chaîne vide)

  2. Sécurité
    - Opération non destructive
    - Utilise ALTER COLUMN avec USING pour conversion sûre
*/

-- Convertir la colonne services de ARRAY en TEXT
ALTER TABLE entreprise 
ALTER COLUMN services TYPE TEXT 
USING CASE 
  WHEN services IS NULL OR array_length(services, 1) IS NULL THEN ''
  ELSE array_to_string(services, E'\n')
END;

-- Définir une valeur par défaut
ALTER TABLE entreprise 
ALTER COLUMN services SET DEFAULT '';
