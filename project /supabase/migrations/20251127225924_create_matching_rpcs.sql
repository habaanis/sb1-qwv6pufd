/*
  # Création des fonctions de matching candidat-offres
  
  1. Nouvelles fonctions
    - `match_jobs_for_candidate(p_candidate_id, p_limit, p_offset)`
      - Trouve les offres d'emploi correspondantes pour un candidat
      - Calcule un score de matching basé sur les compétences et la catégorie
      - Retourne : job_id, title, company, city, score, reason
    
    - `match_candidates_for_job(p_job_id, p_limit, p_offset)`
      - Trouve les candidats correspondants pour une offre
      - Calcule un score de matching basé sur les compétences et la catégorie
      - Retourne : candidate_id, full_name, city, skills, score, reason
  
  2. Sécurité
    - Fonctions publiques accessibles aux utilisateurs authentifiés
    - Respect de la visibilité des profils candidats (public/private)
*/

-- Fonction 1: Match des offres pour un candidat
CREATE OR REPLACE FUNCTION match_jobs_for_candidate(
  p_candidate_id uuid,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  job_id uuid,
  title text,
  company text,
  city text,
  category text,
  contract_type text,
  seniority text,
  skills text[],
  salary_min numeric,
  salary_max numeric,
  score integer,
  reason text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_candidate RECORD;
BEGIN
  -- Récupérer les infos du candidat
  SELECT c.category, c.skills, c.city, c.desired_contracts
  INTO v_candidate
  FROM candidates c
  WHERE c.id = p_candidate_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidate not found';
  END IF;

  RETURN QUERY
  WITH job_matches AS (
    SELECT
      jp.id,
      jp.title,
      jp.company,
      jp.city,
      jp.category,
      jp.contract_type,
      jp.seniority,
      jp.skills,
      jp.salary_min,
      jp.salary_max,
      -- Calcul du score (0-100)
      (
        -- Bonus si même catégorie (30 points)
        CASE WHEN jp.category = v_candidate.category THEN 30 ELSE 0 END +
        
        -- Bonus si même ville (20 points)
        CASE WHEN unaccent(lower(jp.city)) = unaccent(lower(v_candidate.city)) THEN 20 ELSE 0 END +
        
        -- Bonus pour les compétences communes (50 points max)
        LEAST(50, (
          SELECT COUNT(*) * 10
          FROM unnest(jp.skills) AS job_skill
          WHERE EXISTS (
            SELECT 1 FROM unnest(v_candidate.skills) AS cand_skill
            WHERE unaccent(lower(job_skill)) = unaccent(lower(cand_skill))
          )
        )) +
        
        -- Bonus si type de contrat désiré (10 points)
        CASE 
          WHEN v_candidate.desired_contracts IS NOT NULL 
            AND jp.contract_type = ANY(v_candidate.desired_contracts) 
          THEN 10 
          ELSE 0 
        END
      ) AS match_score,
      
      -- Génération de la raison
      (
        CASE 
          WHEN jp.category = v_candidate.category THEN '✓ Même secteur ' 
          ELSE '' 
        END ||
        CASE 
          WHEN unaccent(lower(jp.city)) = unaccent(lower(v_candidate.city)) THEN '✓ Même ville ' 
          ELSE '' 
        END ||
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM unnest(jp.skills) AS job_skill
            WHERE EXISTS (
              SELECT 1 FROM unnest(v_candidate.skills) AS cand_skill
              WHERE unaccent(lower(job_skill)) = unaccent(lower(cand_skill))
            )
          ) THEN '✓ Compétences correspondantes'
          ELSE ''
        END
      ) AS match_reason
    FROM job_postings jp
    WHERE jp.status = 'active'
      AND (jp.expires_at IS NULL OR jp.expires_at > now())
  )
  SELECT
    jm.id,
    jm.title,
    jm.company,
    jm.city,
    jm.category,
    jm.contract_type,
    jm.seniority,
    jm.skills,
    jm.salary_min,
    jm.salary_max,
    jm.match_score,
    TRIM(jm.match_reason)
  FROM job_matches jm
  WHERE jm.match_score > 0
  ORDER BY jm.match_score DESC, jm.id
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Fonction 2: Match des candidats pour une offre
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
    cm.match_score,
    TRIM(cm.match_reason)
  FROM candidate_matches cm
  WHERE cm.match_score > 0
  ORDER BY cm.match_score DESC, cm.id
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION match_jobs_for_candidate TO authenticated;
GRANT EXECUTE ON FUNCTION match_candidates_for_job TO authenticated;
