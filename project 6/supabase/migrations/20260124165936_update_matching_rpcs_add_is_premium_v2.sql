/*
  # Mise à jour des fonctions de matching pour inclure is_premium

  1. Modifications
    - Suppression et recréation de `match_candidates_for_job` avec `is_premium`
    - Permet aux entreprises de voir le statut Premium des candidats
    - Les profils Premium sont priorisés dans les résultats
  
  2. Notes
    - Les profils Premium apparaissent en premier (avant le tri par score)
    - Aucun changement dans la logique de scoring
*/

-- Suppression de l'ancienne fonction
DROP FUNCTION IF EXISTS match_candidates_for_job(uuid, integer, integer);

-- Recréation avec is_premium
CREATE OR REPLACE FUNCTION match_candidates_for_job(
  p_job_id uuid,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  candidate_id uuid,
  full_name text,
  city text,
  category text,
  skills text[],
  experience_years integer,
  is_premium boolean,
  score integer,
  reason text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_job RECORD;
BEGIN
  -- Récupérer les infos de l'offre
  SELECT jp.category, jp.skills, jp.city, jp.contract_type, jp.seniority
  INTO v_job
  FROM job_postings jp
  WHERE jp.id = p_job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job posting not found';
  END IF;

  RETURN QUERY
  WITH candidate_matches AS (
    SELECT
      c.id,
      c.full_name,
      c.city,
      c.category,
      c.skills,
      c.experience_years,
      COALESCE(c.is_premium, false) AS is_premium,
      -- Calcul du score (0-100)
      (
        -- Bonus si même catégorie (30 points)
        CASE WHEN c.category = v_job.category THEN 30 ELSE 0 END +
        
        -- Bonus si même ville (20 points)
        CASE WHEN unaccent(lower(c.city)) = unaccent(lower(v_job.city)) THEN 20 ELSE 0 END +
        
        -- Bonus pour les compétences communes (50 points max)
        LEAST(50, (
          SELECT COUNT(*) * 10
          FROM unnest(v_job.skills) AS job_skill
          WHERE EXISTS (
            SELECT 1 FROM unnest(c.skills) AS cand_skill
            WHERE unaccent(lower(job_skill)) = unaccent(lower(cand_skill))
          )
        )) +
        
        -- Bonus si type de contrat accepté (10 points)
        CASE 
          WHEN c.desired_contracts IS NOT NULL 
            AND v_job.contract_type = ANY(c.desired_contracts) 
          THEN 10 
          ELSE 0 
        END
      ) AS match_score,
      
      -- Génération de la raison
      (
        CASE 
          WHEN c.category = v_job.category THEN '✓ Même secteur ' 
          ELSE '' 
        END ||
        CASE 
          WHEN unaccent(lower(c.city)) = unaccent(lower(v_job.city)) THEN '✓ Même ville ' 
          ELSE '' 
        END ||
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM unnest(v_job.skills) AS job_skill
            WHERE EXISTS (
              SELECT 1 FROM unnest(c.skills) AS cand_skill
              WHERE unaccent(lower(job_skill)) = unaccent(lower(cand_skill))
            )
          ) THEN '✓ Compétences correspondantes'
          ELSE ''
        END
      ) AS match_reason
    FROM candidates c
    WHERE c.visibility = 'public'
  )
  SELECT
    cm.id,
    cm.full_name,
    cm.city,
    cm.category,
    cm.skills,
    cm.experience_years,
    cm.is_premium,
    cm.match_score,
    TRIM(cm.match_reason)
  FROM candidate_matches cm
  WHERE cm.match_score > 0
  ORDER BY 
    cm.is_premium DESC,  -- Les profils Premium en premier
    cm.match_score DESC, 
    cm.id
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION match_candidates_for_job TO authenticated;
