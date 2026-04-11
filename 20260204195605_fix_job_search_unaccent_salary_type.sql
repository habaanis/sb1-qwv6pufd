/*
  # Correction du type de salaire dans la fonction de recherche

  1. Modification
    - Corrige les types salaire_min et salaire_max de integer à numeric
    - Assure la compatibilité avec la structure de la table job_postings
*/

-- Supprimer la fonction existante
DROP FUNCTION IF EXISTS search_jobs_unaccent(text, text, text, text);

-- Recréer avec les bons types
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
  salaire_min numeric,
  salaire_max numeric,
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
    AND (p_gouvernorat = '' OR jp.ville = p_gouvernorat)
    AND (p_secteur = '' OR jp.secteur_emploi = p_secteur)
    AND (
      p_company_name = '' 
      OR unaccent(lower(jp.nom_entreprise)) LIKE '%' || unaccent(lower(p_company_name)) || '%'
    )
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
