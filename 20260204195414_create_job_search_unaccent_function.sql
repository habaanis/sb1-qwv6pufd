/*
  # Fonction de recherche d'emploi insensible aux accents

  1. Nouvelle fonction
    - `search_jobs_unaccent` : Fonction de recherche avancée pour les offres d'emploi
      - Utilise l'extension unaccent pour ignorer les accents
      - Recherche insensible à la casse
      - Filtrage par mot-clé (titre et description)
      - Filtrage par ville/gouvernorat
      - Filtrage par secteur d'emploi
      - Filtrage par nom d'entreprise
      - Tri par pertinence : offres premium d'abord, puis par date

  2. Amélioration
    - Recherche "hôtel" trouvera "Hôtellerie", "hotel", "HOTEL", etc.
    - Recherche "developpeur" trouvera "développeur", "Développeur", etc.
*/

-- Fonction de recherche d'emploi avec unaccent
CREATE OR REPLACE FUNCTION search_jobs_unaccent(
  p_search_term text DEFAULT '',
  p_gouvernorat text DEFAULT '',
  p_secteur text DEFAULT '',
  p_company_name text DEFAULT ''
)
RETURNS TABLE (
  id uuid,
  titre_poste text,
  description_poste text,
  ville text,
  secteur_emploi text,
  type_contrat text,
  created_at timestamptz,
  nom_entreprise text,
  salaire_min integer,
  salaire_max integer,
  niveau_experience text,
  competences_cles text[],
  est_premium boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jp.id,
    jp.titre_poste,
    jp.description_poste,
    jp.ville,
    jp.secteur_emploi,
    jp.type_contrat,
    jp.created_at,
    jp.nom_entreprise,
    jp.salaire_min,
    jp.salaire_max,
    jp.niveau_experience,
    jp.competences_cles,
    jp.est_premium
  FROM job_postings jp
  WHERE jp.statut = 'active'
    -- Filtre par gouvernorat (si fourni)
    AND (p_gouvernorat = '' OR jp.ville = p_gouvernorat)
    -- Filtre par secteur (si fourni)
    AND (p_secteur = '' OR jp.secteur_emploi = p_secteur)
    -- Filtre par nom d'entreprise (insensible aux accents et à la casse)
    AND (
      p_company_name = '' 
      OR unaccent(lower(jp.nom_entreprise)) LIKE '%' || unaccent(lower(p_company_name)) || '%'
    )
    -- Filtre par terme de recherche (insensible aux accents et à la casse)
    AND (
      p_search_term = '' 
      OR unaccent(lower(jp.titre_poste)) LIKE '%' || unaccent(lower(p_search_term)) || '%'
      OR unaccent(lower(jp.description_poste)) LIKE '%' || unaccent(lower(p_search_term)) || '%'
      OR unaccent(lower(jp.nom_entreprise)) LIKE '%' || unaccent(lower(p_search_term)) || '%'
    )
  ORDER BY 
    jp.est_premium DESC NULLS LAST,
    jp.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
