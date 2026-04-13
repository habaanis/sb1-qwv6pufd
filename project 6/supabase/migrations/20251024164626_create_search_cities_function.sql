/*
  # Fonction de recherche de villes avec unaccent

  1. Nouvelle fonction
    - `search_cities_unaccent(search_term TEXT)`
    - Recherche insensible aux accents dans les villes
    - Retourne: name_fr, name_ar, governorate_fr
    - Optimisée avec LIMIT 10

  2. Fonctionnalités
    - Utilise unaccent() pour ignorer les accents
    - Recherche dans name_fr et name_ar
    - Join avec governorates pour le nom du gouvernorat
    - Tri par pertinence (villes commençant par le terme en premier)
    - Retour rapide avec LIMIT 10

  3. Exemples d'utilisation
    - "tun" trouve "Tunis"
    - "souss" trouve "Sousse" (avec ou sans accent)
    - "kair" trouve "Kairouan"
*/

-- Fonction de recherche de villes avec unaccent
CREATE OR REPLACE FUNCTION search_cities_unaccent(search_term TEXT)
RETURNS TABLE (
  name_fr TEXT,
  name_ar TEXT,
  governorate_fr TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name_fr,
    c.name_ar,
    g.name_fr as governorate_fr
  FROM cities c
  LEFT JOIN governorates g ON c.governorate_id = g.id
  WHERE 
    unaccent(lower(c.name_fr)) ILIKE unaccent(lower('%' || search_term || '%'))
    OR unaccent(lower(c.name_ar)) ILIKE unaccent(lower('%' || search_term || '%'))
  ORDER BY 
    CASE 
      WHEN unaccent(lower(c.name_fr)) LIKE unaccent(lower(search_term || '%')) THEN 1
      WHEN unaccent(lower(c.name_ar)) LIKE unaccent(lower(search_term || '%')) THEN 2
      ELSE 3
    END,
    c.name_fr ASC
  LIMIT 10;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION search_cities_unaccent(TEXT) TO anon, authenticated;

-- Commentaire
COMMENT ON FUNCTION search_cities_unaccent IS 'Recherche de villes avec support unaccent (insensible aux accents). Retourne max 10 résultats triés par pertinence.';
