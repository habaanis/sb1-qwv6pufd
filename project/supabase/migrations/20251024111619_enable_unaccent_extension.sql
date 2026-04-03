/*
  # Activation de l'extension unaccent pour recherche sans accents

  1. Extension
    - Active l'extension unaccent dans le schéma public
    - Permet la recherche insensible aux accents français/arabes
  
  2. Fonction utilitaire
    - Crée une fonction helper pour normaliser les recherches
    - Retire les accents automatiquement
*/

-- Activer l'extension unaccent
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;

-- Fonction helper pour normaliser les recherches
CREATE OR REPLACE FUNCTION normalize_search(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(unaccent($1));
$$;
