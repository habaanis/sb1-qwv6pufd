/*
  # Fonction d'incrémentation des vues entreprise

  1. Nouvelle fonction
    - `increment_entreprise_views(entreprise_id)` : Incrémente le compteur de vues
    - Fonction publique accessible à tous (pour tracking automatique)
    - Retourne le nouveau nombre de vues

  2. Sécurité
    - La fonction est sécurisée et n'autorise que l'incrémentation
    - Pas de décrémentation ou modification arbitraire possible
*/

-- Fonction pour incrémenter les vues d'une entreprise
CREATE OR REPLACE FUNCTION increment_entreprise_views(entreprise_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Incrémenter le compteur et retourner la nouvelle valeur
  UPDATE entreprise
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = entreprise_id;

  -- Récupérer la nouvelle valeur
  SELECT views_count INTO new_count
  FROM entreprise
  WHERE id = entreprise_id;

  RETURN COALESCE(new_count, 0);
END;
$$;

-- Autoriser l'exécution publique de la fonction
GRANT EXECUTE ON FUNCTION increment_entreprise_views(uuid) TO anon, authenticated;

-- Commentaire sur la fonction
COMMENT ON FUNCTION increment_entreprise_views IS 'Incrémente le compteur de vues pour une entreprise donnée';
