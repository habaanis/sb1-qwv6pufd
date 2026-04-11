/*
  # Mise à jour des fonctions de recherche d'emplois
  
  1. Modifications
    - Met à jour `job_search` pour inclure skills, seniority, contract_type, description_text
    - Met à jour le type de retour pour correspondre aux nouvelles colonnes
    - Recherche maintenant aussi dans description_text au lieu de description
  
  2. Sécurité
    - Pas de changement RLS, les permissions restent les mêmes
*/

-- Supprimer et recréer la fonction job_search avec les nouveaux champs
DROP FUNCTION IF EXISTS job_search(text, text, text, text, int, int);

CREATE OR REPLACE FUNCTION job_search(
  p_q text DEFAULT '',
  p_categorie text DEFAULT '',
  p_ville text DEFAULT '',
  p_type text DEFAULT '',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  company text,
  category text,
  city text,
  type text,
  description text,
  description_text text,
  requirements text,
  salary_range text,
  salary_min numeric,
  salary_max numeric,
  contact_email text,
  contact_phone text,
  status text,
  created_at timestamptz,
  expires_at timestamptz,
  skills text[],
  seniority text,
  contract_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    jp.id,
    jp.title,
    jp.company,
    jp.category,
    jp.city,
    jp.type,
    jp.description,
    jp.description_text,
    jp.requirements,
    jp.salary_range,
    jp.salary_min,
    jp.salary_max,
    jp.contact_email,
    jp.contact_phone,
    jp.status,
    jp.created_at,
    jp.expires_at,
    jp.skills,
    jp.seniority,
    jp.contract_type
  FROM job_postings jp
  WHERE jp.status = 'active'
    AND (jp.expires_at IS NULL OR jp.expires_at > now())
    AND (
      p_q = '' OR 
      unaccent(lower(jp.title)) ILIKE unaccent(lower('%' || p_q || '%')) OR
      unaccent(lower(jp.company)) ILIKE unaccent(lower('%' || p_q || '%')) OR
      unaccent(lower(COALESCE(jp.description_text, jp.description))) ILIKE unaccent(lower('%' || p_q || '%'))
    )
    AND (p_categorie = '' OR lower(jp.category) = lower(p_categorie))
    AND (p_ville = '' OR unaccent(lower(jp.city)) = unaccent(lower(p_ville)))
    AND (p_type = '' OR lower(COALESCE(jp.contract_type, jp.type)) = lower(p_type))
  ORDER BY jp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
