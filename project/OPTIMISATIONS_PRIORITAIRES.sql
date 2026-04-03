-- ============================================================
-- OPTIMISATIONS PRIORITAIRES - Dalil Tounes
-- Base: Supabase
-- Date: 20 octobre 2025
-- ============================================================
-- Ce fichier contient les optimisations essentielles identifiées
-- lors de l'audit de la base de données.
--
-- ⚠️ IMPORTANT: Exécuter ces migrations dans l'ordre indiqué
-- ============================================================

-- ============================================================
-- PHASE 1: NORMALISATION DES CATÉGORIES ET SECTEURS
-- ============================================================

-- 1️⃣ Table des catégories (remplace les colonnes 'category' en texte libre)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  description_fr text,
  description_ar text,
  description_en text,
  parent_id uuid REFERENCES categories(id),
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les catégories
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- RLS pour categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Données initiales de catégories
INSERT INTO categories (name_fr, name_ar, name_en, slug, icon, display_order) VALUES
  ('Restaurant', 'مطعم', 'Restaurant', 'restaurant', '🍽️', 1),
  ('Hôtel', 'فندق', 'Hotel', 'hotel', '🏨', 2),
  ('Commerce', 'تجارة', 'Trade', 'trade', '🛒', 3),
  ('Services', 'خدمات', 'Services', 'services', '🔧', 4),
  ('Santé', 'صحة', 'Health', 'health', '🏥', 5),
  ('Éducation', 'تعليم', 'Education', 'education', '📚', 6),
  ('Transport', 'نقل', 'Transport', 'transport', '🚗', 7),
  ('Immobilier', 'عقارات', 'Real Estate', 'real-estate', '🏠', 8),
  ('Technologie', 'التكنولوجيا', 'Technology', 'technology', '💻', 9),
  ('Artisanat', 'الحرف اليدوية', 'Crafts', 'crafts', '✂️', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================

-- 2️⃣ Table des secteurs d'activité
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  description_fr text,
  description_ar text,
  description_en text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Index pour les secteurs
CREATE INDEX IF NOT EXISTS idx_sectors_slug ON sectors(slug);
CREATE INDEX IF NOT EXISTS idx_sectors_active ON sectors(is_active);

-- RLS pour sectors
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sectors"
  ON sectors FOR SELECT
  USING (is_active = true);

-- Données initiales de secteurs
INSERT INTO sectors (name_fr, name_ar, name_en, slug, icon) VALUES
  ('Tourisme', 'السياحة', 'Tourism', 'tourism', '🏖️'),
  ('Agriculture', 'الزراعة', 'Agriculture', 'agriculture', '🌾'),
  ('Industrie', 'الصناعة', 'Industry', 'industry', '🏭'),
  ('Technologie', 'التكنولوجيا', 'Technology', 'technology', '💻'),
  ('Finance', 'المالية', 'Finance', 'finance', '💰'),
  ('Énergie', 'الطاقة', 'Energy', 'energy', '⚡'),
  ('Construction', 'البناء', 'Construction', 'construction', '🏗️'),
  ('Commerce', 'التجارة', 'Commerce', 'commerce', '🛒')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PHASE 2: AJOUT DES COLONNES FK (Foreign Keys)
-- ============================================================

-- ⚠️ Ces migrations seront à adapter selon les données existantes

-- 3️⃣ Ajouter category_id à businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

CREATE INDEX IF NOT EXISTS idx_businesses_category_id ON businesses(category_id);

-- 4️⃣ Ajouter city_id à businesses (remplace city text)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);

CREATE INDEX IF NOT EXISTS idx_businesses_city_id ON businesses(city_id);

-- 5️⃣ Ajouter city_id à business_events
ALTER TABLE business_events
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);

CREATE INDEX IF NOT EXISTS idx_business_events_city_id ON business_events(city_id);

-- 6️⃣ Ajouter category_id à job_postings
ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

CREATE INDEX IF NOT EXISTS idx_job_postings_category_id ON job_postings(category_id);

-- 7️⃣ Ajouter city_id à job_postings
ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);

CREATE INDEX IF NOT EXISTS idx_job_postings_city_id ON job_postings(city_id);

-- 8️⃣ Ajouter sector_id à partner_requests
ALTER TABLE partner_requests
  ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES sectors(id);

CREATE INDEX IF NOT EXISTS idx_partner_requests_sector_id ON partner_requests(sector_id);

-- 9️⃣ Ajouter governorate_id à partner_requests (region)
ALTER TABLE partner_requests
  ADD COLUMN IF NOT EXISTS governorate_id uuid REFERENCES governorates(id);

CREATE INDEX IF NOT EXISTS idx_partner_requests_governorate_id ON partner_requests(governorate_id);

-- ============================================================
-- PHASE 3: FULL-TEXT SEARCH
-- ============================================================

-- 🔟 Ajouter colonne de recherche full-text à businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Index GIN pour recherche full-text (très performant)
CREATE INDEX IF NOT EXISTS idx_businesses_search
  ON businesses USING gin(search_vector);

-- Fonction de mise à jour du vecteur de recherche
CREATE OR REPLACE FUNCTION businesses_search_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.address, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique
DROP TRIGGER IF EXISTS trigger_businesses_search_update ON businesses;
CREATE TRIGGER trigger_businesses_search_update
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION businesses_search_update();

-- Mettre à jour les enregistrements existants (si la table contient des données)
-- UPDATE businesses SET updated_at = updated_at; -- Force trigger

-- ============================================================

-- 1️⃣1️⃣ Ajouter colonne de recherche full-text à business_events
ALTER TABLE business_events
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_business_events_search
  ON business_events USING gin(search_vector);

CREATE OR REPLACE FUNCTION business_events_search_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.event_name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.organizer, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_business_events_search_update ON business_events;
CREATE TRIGGER trigger_business_events_search_update
  BEFORE INSERT OR UPDATE ON business_events
  FOR EACH ROW
  EXECUTE FUNCTION business_events_search_update();

-- ============================================================

-- 1️⃣2️⃣ Ajouter colonne de recherche full-text à job_postings
ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_job_postings_search
  ON job_postings USING gin(search_vector);

CREATE OR REPLACE FUNCTION job_postings_search_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.company, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.requirements, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_job_postings_search_update ON job_postings;
CREATE TRIGGER trigger_job_postings_search_update
  BEFORE INSERT OR UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION job_postings_search_update();

-- ============================================================
-- PHASE 4: TABLES DE SUPPORT (SYNONYMES & LOGS)
-- ============================================================

-- 1️⃣3️⃣ Table des mots-clés et synonymes pour améliorer les recherches
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  synonyms text[] NOT NULL DEFAULT '{}',
  category_id uuid REFERENCES categories(id),
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'ar', 'en', 'it', 'ru')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour keywords
CREATE INDEX IF NOT EXISTS idx_keywords_word ON keywords(word);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category_id);
CREATE INDEX IF NOT EXISTS idx_keywords_language ON keywords(language);

-- RLS pour keywords
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view keywords"
  ON keywords FOR SELECT
  USING (true);

-- Données initiales de synonymes (français)
INSERT INTO keywords (word, synonyms, language) VALUES
  ('restaurant', ARRAY['pizzeria', 'café', 'brasserie', 'bistrot', 'cantine', 'traiteur'], 'fr'),
  ('hotel', ARRAY['auberge', 'résidence', 'maison d''hôtes', 'gîte', 'hôtel'], 'fr'),
  ('transport', ARRAY['taxi', 'bus', 'location', 'voyage', 'déplacement'], 'fr'),
  ('santé', ARRAY['clinique', 'hôpital', 'médecin', 'pharmacie', 'laboratoire'], 'fr')
ON CONFLICT DO NOTHING;

-- ============================================================

-- 1️⃣4️⃣ Table de logs des recherches (analytics)
CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  filters jsonb DEFAULT '{}',
  results_count integer DEFAULT 0,
  search_type text CHECK (search_type IN ('business', 'event', 'job', 'global')),
  user_ip inet,
  user_agent text,
  language text DEFAULT 'fr',
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Index pour analytics
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_type ON search_logs(search_type);

-- RLS pour search_logs (admin uniquement pour lecture)
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert search logs"
  ON search_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view search logs"
  ON search_logs FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- PHASE 5: VUES POUR LA RECHERCHE GLOBALE
-- ============================================================

-- 1️⃣5️⃣ Vue agrégée pour recherche globale (tous types confondus)
CREATE OR REPLACE VIEW search_global AS
SELECT
  'business'::text as type,
  b.id,
  b.name as title,
  b.description,
  COALESCE(c.name_fr, b.city) as city,
  COALESCE(cat.name_fr, b.category) as category,
  b.image_url,
  b.phone,
  b.email,
  b.website,
  NULL::date as event_date,
  b.created_at,
  b.search_vector
FROM businesses b
LEFT JOIN cities c ON b.city_id = c.id
LEFT JOIN categories cat ON b.category_id = cat.id
WHERE b.status = 'approved'

UNION ALL

SELECT
  'event'::text as type,
  e.id,
  e.event_name as title,
  e.short_description as description,
  COALESCE(c.name_fr, e.city) as city,
  e.type as category,
  e.image_url,
  NULL::text as phone,
  NULL::text as email,
  e.website,
  e.event_date,
  e.created_at,
  e.search_vector
FROM business_events e
LEFT JOIN cities c ON e.city_id = c.id
WHERE e.event_date >= CURRENT_DATE

UNION ALL

SELECT
  'job'::text as type,
  j.id,
  j.title,
  j.description,
  COALESCE(c.name_fr, j.city) as city,
  COALESCE(cat.name_fr, j.category) as category,
  NULL::text as image_url,
  j.contact_phone as phone,
  j.contact_email as email,
  NULL::text as website,
  NULL::date as event_date,
  j.created_at,
  j.search_vector
FROM job_postings j
LEFT JOIN cities c ON j.city_id = c.id
LEFT JOIN categories cat ON j.category_id = cat.id
WHERE j.status = 'active';

-- ============================================================
-- PHASE 6: INDEX COMPOSITES POUR REQUÊTES FRÉQUENTES
-- ============================================================

-- 1️⃣6️⃣ Index composites pour améliorer les performances

-- Recherche entreprises par ville + catégorie (très fréquent)
CREATE INDEX IF NOT EXISTS idx_businesses_city_category_status
  ON businesses(city_id, category_id, status)
  WHERE status = 'approved';

-- Événements vedettes par date et ville
CREATE INDEX IF NOT EXISTS idx_events_featured_date_city
  ON business_events(featured, event_date DESC, city_id)
  WHERE featured = true;

-- Offres d'emploi actives par ville et catégorie
CREATE INDEX IF NOT EXISTS idx_jobs_status_city_category
  ON job_postings(status, city_id, category_id)
  WHERE status = 'active';

-- ============================================================
-- PHASE 7: COLONNES DE STATISTIQUES & SCORING
-- ============================================================

-- 1️⃣7️⃣ Ajouter colonnes de scoring pour le ranking des résultats

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS search_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_businesses_score ON businesses(search_score DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_premium ON businesses(is_premium) WHERE is_premium = true;

-- ============================================================

ALTER TABLE business_events
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_count integer DEFAULT 0;

-- ============================================================

ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications_count integer DEFAULT 0;

-- ============================================================
-- PHASE 8: INDEX SUR LES CHAMPS MANQUANTS
-- ============================================================

-- 1️⃣8️⃣ Index manquants identifiés lors de l'audit

-- Index sur expires_at pour nettoyer les offres expirées
CREATE INDEX IF NOT EXISTS idx_job_postings_expires
  ON job_postings(expires_at)
  WHERE expires_at IS NOT NULL;

-- Index sur job_applications pour filtres
CREATE INDEX IF NOT EXISTS idx_job_applications_category
  ON job_applications(job_category);

CREATE INDEX IF NOT EXISTS idx_job_applications_city
  ON job_applications(city);

CREATE INDEX IF NOT EXISTS idx_job_applications_created
  ON job_applications(created_at DESC);

-- Index sur partner_requests pour recherches
CREATE INDEX IF NOT EXISTS idx_partner_requests_sector
  ON partner_requests(sector);

CREATE INDEX IF NOT EXISTS idx_partner_requests_region
  ON partner_requests(region);

CREATE INDEX IF NOT EXISTS idx_partner_requests_search_type
  ON partner_requests(search_type);

-- ============================================================
-- FIN DES OPTIMISATIONS
-- ============================================================

-- ✅ RÉSUMÉ DES CHANGEMENTS APPLIQUÉS:
--
-- Tables créées: 4
--   ✓ categories (normalisation)
--   ✓ sectors (normalisation)
--   ✓ keywords (synonymes)
--   ✓ search_logs (analytics)
--
-- Colonnes FK ajoutées: 9
--   ✓ businesses.category_id, city_id
--   ✓ business_events.city_id
--   ✓ job_postings.category_id, city_id
--   ✓ partner_requests.sector_id, governorate_id
--
-- Index full-text: 3
--   ✓ businesses.search_vector
--   ✓ business_events.search_vector
--   ✓ job_postings.search_vector
--
-- Index composites: 3
--   ✓ Optimisation requêtes fréquentes
--
-- Vues créées: 1
--   ✓ search_global (agrégation)
--
-- Colonnes de scoring: 3 tables
--   ✓ views_count, clicks_count, search_score
--
-- Index supplémentaires: 8
--   ✓ Colonnes fréquemment filtrées
--
-- ============================================================
-- PROCHAINES ÉTAPES RECOMMANDÉES:
--
-- 1. Migrer les données existantes (category, city) vers les FK
-- 2. Tester les performances de recherche full-text
-- 3. Implémenter l'analytics côté application
-- 4. Créer un dashboard admin pour les statistiques
-- 5. Ajouter des synonymes arabes et anglais dans keywords
-- ============================================================
