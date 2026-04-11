-- Ajout des colonnes de confiance et objectivit\u00e9 pour la cat\u00e9gorie \u00c9ducation
-- 
-- 1. Nouvelles colonnes ajout\u00e9es:
--    - taux_reussite_bac: Taux de r\u00e9ussite au baccalaur\u00e9at (0-100)
--    - ratio_eleves_prof: Ratio \u00e9l\u00e8ves/professeur
--    - homologation_etrangere: Certification par entit\u00e9s \u00e9trang\u00e8res (AEFE, etc.)
--    - agrement_ministre: Agr\u00e9ment du Minist\u00e8re Tunisien
--    - lien_video_visite: Lien YouTube/Vimeo pour visite virtuelle (Premium)
--    - services_inclus: Liste des services inclus dans les frais
--    - annee_fondation: Ann\u00e9e de fondation de l'\u00e9tablissement
--    - capacite_accueil: Nombre total d'\u00e9l\u00e8ves
--    - langues_enseignees: Tableau des langues enseign\u00e9es
--    - activites_extra: Activit\u00e9s extra-scolaires
--    - cantine: Disponibilit\u00e9 cantine
--    - internat: Disponibilit\u00e9 internat
-- 
-- 2. Am\u00e9liorations: Colonnes pour comparaison et aide \u00e0 la d\u00e9cision

-- Ajouter les colonnes si elles n'existent pas
DO $$ 
BEGIN
  -- Taux de r\u00e9ussite BAC
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'taux_reussite_bac'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN taux_reussite_bac numeric;
  END IF;

  -- Ratio \u00e9l\u00e8ves/professeur (d\u00e9j\u00e0 existe, mais on v\u00e9rifie)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'ratio_eleves_prof'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN ratio_eleves_prof numeric;
  END IF;

  -- Homologation \u00e9trang\u00e8re
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'homologation_etrangere'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN homologation_etrangere boolean DEFAULT false;
  END IF;

  -- Agr\u00e9ment minist\u00e8re
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'agrement_ministre'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN agrement_ministre boolean DEFAULT false;
  END IF;

  -- Lien vid\u00e9o visite virtuelle (Premium/VIP)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'lien_video_visite'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN lien_video_visite text;
  END IF;

  -- Services inclus dans les frais
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'services_inclus'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN services_inclus text[] DEFAULT '{}';
  END IF;

  -- Ann\u00e9e de fondation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'annee_fondation'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN annee_fondation integer;
  END IF;

  -- Capacit\u00e9 d'accueil
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'capacite_accueil'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN capacite_accueil integer;
  END IF;

  -- Langues enseign\u00e9es
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'langues_enseignees'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN langues_enseignees text[] DEFAULT '{}';
  END IF;

  -- Activit\u00e9s extra-scolaires
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'activites_extra'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN activites_extra text[] DEFAULT '{}';
  END IF;

  -- Cantine disponible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'cantine'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN cantine boolean DEFAULT false;
  END IF;

  -- Internat disponible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'internat'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN internat boolean DEFAULT false;
  END IF;

  -- Photos/images (galerie)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'photos'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN photos text[] DEFAULT '{}';
  END IF;

  -- Frais de scolarit\u00e9 min et max (pour comparaison pr\u00e9cise)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'frais_min'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN frais_min numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'etablissements_education' AND column_name = 'frais_max'
  ) THEN
    ALTER TABLE etablissements_education ADD COLUMN frais_max numeric;
  END IF;

END $$;

-- Cr\u00e9er des indexes pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_etablissements_homologation ON etablissements_education(homologation_etrangere) WHERE homologation_etrangere = true;
CREATE INDEX IF NOT EXISTS idx_etablissements_agrement ON etablissements_education(agrement_ministre) WHERE agrement_ministre = true;
CREATE INDEX IF NOT EXISTS idx_etablissements_taux_reussite ON etablissements_education(taux_reussite_bac DESC) WHERE taux_reussite_bac IS NOT NULL;