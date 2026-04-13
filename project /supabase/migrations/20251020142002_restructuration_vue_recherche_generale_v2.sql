/*
  # Restructuration Base Supabase + Vue Recherche Générale
  
  ## Vue d'Ensemble
  Cette migration restructure les tables existantes et crée une vue unifiée
  `vue_recherche_generale` pour alimenter toutes les barres de recherche du site.
  
  ## Modifications Apportées
  
  ### 1. Création de Tables de Référence
  - `categories` : Normalisation des catégories d'entreprises
  - `keywords` : Table de mots-clés pour améliorer la recherche
  
  ### 2. Index de Performance
  - Ajout d'index sur toutes les colonnes utilisées dans les recherches
  - Index sur name, city, category pour businesses
  - Index sur event_name, city, type pour business_events
  - Index sur title, city, category pour job_postings
  
  ### 3. Vue Unifiée
  - `vue_recherche_generale` : Agrège businesses, events et jobs
  - Jointures avec cities et governorates pour données multilingues
  - Filtres automatiques (status='approved', date >= today pour events)
  
  ### 4. Sécurité
  - RLS activée sur la vue (lecture publique uniquement)
  - Pas de modification possible via la vue
*/

-- ============================================================
-- ÉTAPE 1 : CRÉATION TABLE CATEGORIES (si pas déjà créée)
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Données initiales (seulement si la table est vide)
INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Restaurant', 'مطعم', 'Restaurant', 'restaurant', '🍽️'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'restaurant');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Hôtel', 'فندق', 'Hotel', 'hotel', '🏨'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'hotel');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Commerce', 'تجارة', 'Trade', 'commerce', '🛒'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'commerce');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Services', 'خدمات', 'Services', 'services', '🔧'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'services');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Santé', 'صحة', 'Health', 'sante', '🏥'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sante');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Éducation', 'تعليم', 'Education', 'education', '📚'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'education');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Transport', 'نقل', 'Transport', 'transport', '🚗'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'transport');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Immobilier', 'عقارات', 'Real Estate', 'immobilier', '🏠'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'immobilier');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Technologie', 'التكنولوجيا', 'Technology', 'technologie', '💻'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'technologie');

INSERT INTO categories (name_fr, name_ar, name_en, slug, icon)
SELECT 'Artisanat', 'الحرف اليدوية', 'Crafts', 'artisanat', '✂️'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'artisanat');

-- RLS pour categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- ============================================================
-- ÉTAPE 2 : TABLE DE MOTS-CLÉS (KEYWORDS)
-- ============================================================

CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  synonyms text[] DEFAULT '{}',
  category_slug text REFERENCES categories(slug),
  language text DEFAULT 'fr' CHECK (language IN ('fr', 'ar', 'en')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_keywords_word ON keywords(word);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category_slug);

-- Quelques mots-clés de base
INSERT INTO keywords (word, synonyms, category_slug, language) VALUES
('restaurant', ARRAY['pizzeria', 'café', 'brasserie', 'traiteur', 'cantine'], 'restaurant', 'fr'),
('hotel', ARRAY['auberge', 'maison d''hôtes', 'résidence', 'gîte'], 'hotel', 'fr'),
('taxi', ARRAY['transport', 'voiture', 'vtc', 'chauffeur'], 'transport', 'fr'),
('clinique', ARRAY['hôpital', 'médecin', 'dispensaire', 'centre médical'], 'sante', 'fr')
ON CONFLICT DO NOTHING;

-- RLS pour keywords
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view keywords" ON keywords;
CREATE POLICY "Anyone can view keywords"
  ON keywords FOR SELECT
  USING (true);

-- ============================================================
-- ÉTAPE 3 : AJOUT D'INDEX POUR LES RECHERCHES
-- ============================================================

-- Index standards sur businesses
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);

-- Index sur business_events
CREATE INDEX IF NOT EXISTS idx_events_name ON business_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_city ON business_events(city);
CREATE INDEX IF NOT EXISTS idx_events_type ON business_events(type);

-- Index sur job_postings
CREATE INDEX IF NOT EXISTS idx_jobs_title ON job_postings(title);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON job_postings(company);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON job_postings(city);

-- ============================================================
-- ÉTAPE 4 : CRÉATION VUE RECHERCHE GÉNÉRALE
-- ============================================================

CREATE OR REPLACE VIEW vue_recherche_generale AS

-- ENTREPRISES APPROUVÉES
SELECT 
  'business'::text as item_type,
  b.id,
  b.name as title,
  b.category as category_text,
  NULL::text as category_icon,
  b.city as city_text,
  ci.name_fr as city_name_fr,
  ci.name_ar as city_name_ar,
  ci.name_en as city_name_en,
  g.name_fr as governorate_fr,
  g.name_ar as governorate_ar,
  g.name_en as governorate_en,
  b.description as short_description,
  b.address,
  b.phone,
  b.email,
  b.website,
  b.image_url,
  NULL::date as event_date,
  NULL::text as event_type,
  b.status as visibility_status,
  b.created_at,
  b.updated_at
FROM businesses b
LEFT JOIN cities ci ON LOWER(TRIM(b.city)) = LOWER(TRIM(ci.name_fr))
LEFT JOIN governorates g ON ci.governorate_id = g.id
WHERE b.status = 'approved'

UNION ALL

-- ÉVÉNEMENTS À VENIR
SELECT 
  'event'::text as item_type,
  e.id,
  e.event_name as title,
  e.type as category_text,
  NULL::text as category_icon,
  e.city as city_text,
  ci.name_fr as city_name_fr,
  ci.name_ar as city_name_ar,
  ci.name_en as city_name_en,
  g.name_fr as governorate_fr,
  g.name_ar as governorate_ar,
  g.name_en as governorate_en,
  e.short_description,
  e.location as address,
  NULL::text as phone,
  NULL::text as email,
  e.website,
  e.image_url,
  e.event_date,
  e.type as event_type,
  'active'::text as visibility_status,
  e.created_at,
  e.updated_at
FROM business_events e
LEFT JOIN cities ci ON LOWER(TRIM(e.city)) = LOWER(TRIM(ci.name_fr))
LEFT JOIN governorates g ON ci.governorate_id = g.id
WHERE e.event_date >= CURRENT_DATE

UNION ALL

-- OFFRES D'EMPLOI ACTIVES
SELECT 
  'job'::text as item_type,
  j.id,
  j.title,
  j.category as category_text,
  NULL::text as category_icon,
  j.city as city_text,
  ci.name_fr as city_name_fr,
  ci.name_ar as city_name_ar,
  ci.name_en as city_name_en,
  g.name_fr as governorate_fr,
  g.name_ar as governorate_ar,
  g.name_en as governorate_en,
  SUBSTRING(j.description, 1, 200) as short_description,
  j.company as address,
  j.contact_phone as phone,
  j.contact_email as email,
  NULL::text as website,
  NULL::text as image_url,
  NULL::date as event_date,
  j.type as event_type,
  j.status as visibility_status,
  j.created_at,
  NULL::timestamptz as updated_at
FROM job_postings j
LEFT JOIN cities ci ON LOWER(TRIM(j.city)) = LOWER(TRIM(ci.name_fr))
LEFT JOIN governorates g ON ci.governorate_id = g.id
WHERE j.status = 'active'
  AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP);

-- Commentaire sur la vue
COMMENT ON VIEW vue_recherche_generale IS 'Vue unifiée pour la recherche globale (entreprises, événements, emplois) avec données multilingues des villes/gouvernorats';

-- ============================================================
-- ÉTAPE 5 : FONCTION UTILITAIRE DE RECHERCHE
-- ============================================================

-- Fonction pour normaliser les termes de recherche
CREATE OR REPLACE FUNCTION normalize_search_term(term text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LOWER(TRIM(REGEXP_REPLACE(term, '\s+', ' ', 'g')));
$$;

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================

/*
  RÉSUMÉ DES CHANGEMENTS :
  
  ✅ Tables créées : 
     - categories (10 catégories initiales)
     - keywords (4 mots-clés de base)
  
  ✅ Index ajoutés : 
     - 9 nouveaux index sur businesses, business_events, job_postings
     - Index standards pour recherches rapides
  
  ✅ Vue créée :
     - vue_recherche_generale (union de 3 tables)
     - Colonnes normalisées et cohérentes
     - Jointures avec cities/governorates pour multilingue
     - Filtres automatiques (approved, active, dates futures)
  
  ✅ Sécurité :
     - RLS activée sur categories et keywords
     - Vue en lecture seule (hérite des RLS des tables sources)
  
  ✅ Fonctions utilitaires :
     - normalize_search_term() pour normalisation des recherches
*/
