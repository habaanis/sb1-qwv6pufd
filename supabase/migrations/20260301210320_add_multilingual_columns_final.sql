/*
  # Ajout des colonnes multilingues (AR, EN, IT, RU)

  Support complet i18n pour 5 langues : FR (défaut), AR, EN, IT, RU
  
  Tables modifiées :
  - entreprise
  - evenements_locaux  
  - etablissements_education (existe?)
  - professeurs_prives
  - job_postings
  - evenements_culturels
*/

-- ENTREPRISE
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS nom_ar TEXT,
ADD COLUMN IF NOT EXISTS nom_en TEXT,
ADD COLUMN IF NOT EXISTS nom_it TEXT,
ADD COLUMN IF NOT EXISTS nom_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_it TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT,
ADD COLUMN IF NOT EXISTS services_ar TEXT,
ADD COLUMN IF NOT EXISTS services_en TEXT,
ADD COLUMN IF NOT EXISTS services_it TEXT,
ADD COLUMN IF NOT EXISTS services_ru TEXT,
ADD COLUMN IF NOT EXISTS adresse_ar TEXT,
ADD COLUMN IF NOT EXISTS adresse_en TEXT,
ADD COLUMN IF NOT EXISTS adresse_it TEXT,
ADD COLUMN IF NOT EXISTS adresse_ru TEXT;

-- EVENEMENTS_LOCAUX
ALTER TABLE evenements_locaux
ADD COLUMN IF NOT EXISTS titre_ar TEXT,
ADD COLUMN IF NOT EXISTS titre_en TEXT,
ADD COLUMN IF NOT EXISTS titre_it TEXT,
ADD COLUMN IF NOT EXISTS titre_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_it TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT,
ADD COLUMN IF NOT EXISTS description_courte_ar TEXT,
ADD COLUMN IF NOT EXISTS description_courte_en TEXT,
ADD COLUMN IF NOT EXISTS description_courte_it TEXT,
ADD COLUMN IF NOT EXISTS description_courte_ru TEXT,
ADD COLUMN IF NOT EXISTS lieu_ar TEXT,
ADD COLUMN IF NOT EXISTS lieu_en TEXT,
ADD COLUMN IF NOT EXISTS lieu_it TEXT,
ADD COLUMN IF NOT EXISTS lieu_ru TEXT;

-- PROFESSEURS_PRIVES
ALTER TABLE professeurs_prives
ADD COLUMN IF NOT EXISTS matieres_ar TEXT,
ADD COLUMN IF NOT EXISTS matieres_en TEXT,
ADD COLUMN IF NOT EXISTS matieres_it TEXT,
ADD COLUMN IF NOT EXISTS matieres_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_it TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT;

-- JOB_POSTINGS
ALTER TABLE job_postings
ADD COLUMN IF NOT EXISTS titre_ar TEXT,
ADD COLUMN IF NOT EXISTS titre_en TEXT,
ADD COLUMN IF NOT EXISTS titre_it TEXT,
ADD COLUMN IF NOT EXISTS titre_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_it TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT;

-- EVENEMENTS_CULTURELS
ALTER TABLE evenements_culturels
ADD COLUMN IF NOT EXISTS titre_ar TEXT,
ADD COLUMN IF NOT EXISTS titre_en TEXT,
ADD COLUMN IF NOT EXISTS titre_it TEXT,
ADD COLUMN IF NOT EXISTS titre_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_it TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT,
ADD COLUMN IF NOT EXISTS lieu_ar TEXT,
ADD COLUMN IF NOT EXISTS lieu_en TEXT,
ADD COLUMN IF NOT EXISTS lieu_it TEXT,
ADD COLUMN IF NOT EXISTS lieu_ru TEXT;

-- INDEX pour recherche multilingue
CREATE INDEX IF NOT EXISTS idx_entreprise_nom_ar_trgm ON entreprise USING gin(nom_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entreprise_nom_en_trgm ON entreprise USING gin(nom_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_evenements_titre_ar_trgm ON evenements_locaux USING gin(titre_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_evenements_titre_en_trgm ON evenements_locaux USING gin(titre_en gin_trgm_ops);
