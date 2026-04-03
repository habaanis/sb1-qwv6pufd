/*
  # Am\u00e9lioration Syst\u00e8me de Recherche G\u00e9ographique - Dalil Tounes

  Ce fichier contient les am\u00e9liorations pour la recherche g\u00e9ographique et cat\u00e9gorielle.

  ## Modifications

  ### 1. Table `businesses`
  - Ajout colonne `governorate_id` (UUID) : R\u00e9f\u00e9rence au gouvernorat
  - Ajout colonne `city_id` (UUID) : R\u00e9f\u00e9rence \u00e0 la ville
  - Ajout colonne `category_id` (UUID) : R\u00e9f\u00e9rence \u00e0 la cat\u00e9gorie
  - Ajout colonne `location` (GEOMETRY POINT) : Coordonn\u00e9es GPS

  ### 2. Table `cities`
  - Ajout 50+ villes suppl\u00e9mentaires pour couvrir toute la Tunisie

  ### 3. Index de Performance
  - Index sur governorate_id
  - Index sur city_id
  - Index sur category_id
  - Index spatial sur location

  ### 4. Vue `vue_recherche_generale`
  - Mise \u00e0 jour avec les nouvelles colonnes
  - Jointure avec governorates, cities, categories

  ## Donn\u00e9es

  - 24 gouvernorats (d\u00e9j\u00e0 pr\u00e9sents)
  - 150+ villes (102 existantes + 50 nouvelles)
  - 10 cat\u00e9gories (d\u00e9j\u00e0 pr\u00e9sentes)
*/

-- ============================================================
-- SECTION 1 : AM\u00c9LIORATION TABLE BUSINESSES
-- ============================================================

-- Ajouter colonnes pour les r\u00e9f\u00e9rences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'governorate_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN governorate_id uuid REFERENCES governorates(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN city_id uuid REFERENCES cities(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'location'
  ) THEN
    ALTER TABLE businesses ADD COLUMN location geometry(Point, 4326);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE businesses ADD COLUMN latitude numeric(10,7);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE businesses ADD COLUMN longitude numeric(10,7);
  END IF;
END $$;

-- ============================================================
-- SECTION 2 : AJOUT DE 50+ VILLES SUPPL\u00c9MENTAIRES
-- ============================================================

-- R\u00e9cup\u00e9rer les IDs des gouvernorats pour insertion
DO $$
DECLARE
  tunis_id uuid;
  ariana_id uuid;
  ben_arous_id uuid;
  manouba_id uuid;
  nabeul_id uuid;
  zaghouan_id uuid;
  bizerte_id uuid;
  beja_id uuid;
  jendouba_id uuid;
  kef_id uuid;
  siliana_id uuid;
  sousse_id uuid;
  monastir_id uuid;
  mahdia_id uuid;
  sfax_id uuid;
  kairouan_id uuid;
  kasserine_id uuid;
  sidi_bouzid_id uuid;
  gabes_id uuid;
  medenine_id uuid;
  tataouine_id uuid;
  gafsa_id uuid;
  tozeur_id uuid;
  kebili_id uuid;
BEGIN
  -- R\u00e9cup\u00e9rer les IDs des gouvernorats
  SELECT id INTO tunis_id FROM governorates WHERE name_fr = 'Tunis' LIMIT 1;
  SELECT id INTO ariana_id FROM governorates WHERE name_fr = 'Ariana' LIMIT 1;
  SELECT id INTO ben_arous_id FROM governorates WHERE name_fr = 'Ben Arous' LIMIT 1;
  SELECT id INTO manouba_id FROM governorates WHERE name_fr = 'Manouba' LIMIT 1;
  SELECT id INTO nabeul_id FROM governorates WHERE name_fr = 'Nabeul' LIMIT 1;
  SELECT id INTO zaghouan_id FROM governorates WHERE name_fr = 'Zaghouan' LIMIT 1;
  SELECT id INTO bizerte_id FROM governorates WHERE name_fr = 'Bizerte' LIMIT 1;
  SELECT id INTO beja_id FROM governorates WHERE name_fr = 'B\u00e9ja' LIMIT 1;
  SELECT id INTO jendouba_id FROM governorates WHERE name_fr = 'Jendouba' LIMIT 1;
  SELECT id INTO kef_id FROM governorates WHERE name_fr = 'Le Kef' LIMIT 1;
  SELECT id INTO siliana_id FROM governorates WHERE name_fr = 'Siliana' LIMIT 1;
  SELECT id INTO sousse_id FROM governorates WHERE name_fr = 'Sousse' LIMIT 1;
  SELECT id INTO monastir_id FROM governorates WHERE name_fr = 'Monastir' LIMIT 1;
  SELECT id INTO mahdia_id FROM governorates WHERE name_fr = 'Mahdia' LIMIT 1;
  SELECT id INTO sfax_id FROM governorates WHERE name_fr = 'Sfax' LIMIT 1;
  SELECT id INTO kairouan_id FROM governorates WHERE name_fr = 'Kairouan' LIMIT 1;
  SELECT id INTO kasserine_id FROM governorates WHERE name_fr = 'Kasserine' LIMIT 1;
  SELECT id INTO sidi_bouzid_id FROM governorates WHERE name_fr = 'Sidi Bouzid' LIMIT 1;
  SELECT id INTO gabes_id FROM governorates WHERE name_fr = 'Gab\u00e8s' LIMIT 1;
  SELECT id INTO medenine_id FROM governorates WHERE name_fr = 'M\u00e9denine' LIMIT 1;
  SELECT id INTO tataouine_id FROM governorates WHERE name_fr = 'Tataouine' LIMIT 1;
  SELECT id INTO gafsa_id FROM governorates WHERE name_fr = 'Gafsa' LIMIT 1;
  SELECT id INTO tozeur_id FROM governorates WHERE name_fr = 'Tozeur' LIMIT 1;
  SELECT id INTO kebili_id FROM governorates WHERE name_fr = 'K\u00e9bili' LIMIT 1;

  -- Villes suppl\u00e9mentaires Grand Tunis
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (tunis_id, 'La Goulette', '\u062d\u0644\u0642 \u0627\u0644\u0648\u0627\u062f\u064a', 'La Goulette'),
    (tunis_id, 'El Omrane', '\u0627\u0644\u0639\u0645\u0631\u0627\u0646', 'El Omrane'),
    (tunis_id, 'Sidi El B\u00e9chir', '\u0633\u064a\u062f\u064a \u0627\u0644\u0628\u0634\u064a\u0631', 'Sidi El Bechir'),
    (tunis_id, 'El Mourouj', '\u0627\u0644\u0645\u0631\u0648\u062c', 'El Mourouj'),
    (tunis_id, 'Ezzahra', '\u0627\u0644\u0632\u0647\u0631\u0627\u0621', 'Ezzahra'),
    (tunis_id, 'Bab Souika', '\u0628\u0627\u0628 \u0633\u0648\u064a\u0642\u0629', 'Bab Souika')
  ON CONFLICT DO NOTHING;

  -- Villes Ariana
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (ariana_id, 'Raoued', '\u0627\u0644\u0631\u0648\u0627\u062f', 'Raoued'),
    (ariana_id, 'Ettadhamen', '\u0627\u0644\u062a\u0636\u0627\u0645\u0646', 'Ettadhamen'),
    (ariana_id, 'Mnihla', '\u0627\u0644\u0645\u0646\u064a\u0647\u0644\u0629', 'Mnihla')
  ON CONFLICT DO NOTHING;

  -- Villes Ben Arous
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (ben_arous_id, 'Hammam Lif', '\u062d\u0645\u0627\u0645 \u0627\u0644\u0623\u0646\u0641', 'Hammam Lif'),
    (ben_arous_id, 'Hammam Ch\u00f4tt', '\u062d\u0645\u0627\u0645 \u0627\u0644\u0634\u0637', 'Hammam Chott'),
    (ben_arous_id, 'Bou Mhel El Bassatine', '\u0628\u0648\u0645\u0647\u0644 \u0627\u0644\u0628\u0633\u0627\u062a\u064a\u0646', 'Bou Mhel El Bassatine'),
    (ben_arous_id, 'Fouchana', '\u0641\u0648\u0634\u0627\u0646\u0629', 'Fouchana')
  ON CONFLICT DO NOTHING;

  -- Villes Manouba
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (manouba_id, 'Oued Ellil', '\u0648\u0627\u062f \u0627\u0644\u0644\u064a\u0644', 'Oued Ellil'),
    (manouba_id, 'Douar Hicher', '\u062f\u0648\u0627\u0631 \u0647\u064a\u0634\u0631', 'Douar Hicher'),
    (manouba_id, 'Tebourba', '\u0637\u0628\u0631\u0628\u0629', 'Tebourba')
  ON CONFLICT DO NOTHING;

  -- Villes Nabeul
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (nabeul_id, 'Dar Chaabane', '\u062f\u0627\u0631 \u0634\u0639\u0628\u0627\u0646', 'Dar Chaabane'),
    (nabeul_id, 'B\u00e9ni Khalled', '\u0628\u0646\u064a \u062e\u0644\u0627\u062f', 'Beni Khalled'),
    (nabeul_id, 'Takelsa', '\u062a\u0627\u0643\u0644\u0633\u0629', 'Takelsa'),
    (nabeul_id, 'Menzel Temime', '\u0645\u0646\u0632\u0644 \u062a\u0645\u064a\u0645', 'Menzel Temime'),
    (nabeul_id, 'Kelibia', '\u0642\u0644\u064a\u0628\u064a\u0629', 'Kelibia'),
    (nabeul_id, 'El Haouaria', '\u0627\u0644\u0647\u0648\u0627\u0631\u064a\u0629', 'El Haouaria')
  ON CONFLICT DO NOTHING;

  -- Villes Sousse
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (sousse_id, 'Msaken', '\u0645\u0633\u0627\u0643\u0646', 'Msaken'),
    (sousse_id, 'Kalaa Kebira', '\u0642\u0644\u0639\u0629 \u0627\u0644\u0643\u0628\u0631\u0649', 'Kalaa Kebira'),
    (sousse_id, 'Kalaa Sghira', '\u0642\u0644\u0639\u0629 \u0627\u0644\u0635\u063a\u0631\u0649', 'Kalaa Sghira'),
    (sousse_id, 'Enfidha', '\u0627\u0644\u0646\u0641\u064a\u0636\u0629', 'Enfidha'),
    (sousse_id, 'Bouficha', '\u0628\u0648\u0641\u064a\u0634\u0629', 'Bouficha')
  ON CONFLICT DO NOTHING;

  -- Villes Monastir
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (monastir_id, 'Teboulba', '\u0637\u0628\u0644\u0628\u0629', 'Teboulba'),
    (monastir_id, 'Ksar Hellal', '\u0642\u0635\u0631 \u0647\u0644\u0627\u0644', 'Ksar Hellal'),
    (monastir_id, 'Moknine', '\u0627\u0644\u0645\u0643\u0646\u064a\u0646', 'Moknine'),
    (monastir_id, 'Bekalta', '\u0628\u0642\u0644\u0637\u0629', 'Bekalta'),
    (monastir_id, 'Jemmal', '\u062c\u0645\u0627\u0644', 'Jemmal')
  ON CONFLICT DO NOTHING;

  -- Villes Mahdia
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (mahdia_id, 'Ksour Essef', '\u0642\u0635\u0648\u0631 \u0627\u0644\u0633\u0627\u0641', 'Ksour Essef'),
    (mahdia_id, 'El Jem', '\u0627\u0644\u062c\u0645', 'El Jem'),
    (mahdia_id, 'Chebba', '\u0627\u0644\u0634\u0627\u0628\u0629', 'Chebba'),
    (mahdia_id, 'Melloul\u00e8che', '\u0645\u0644\u0648\u0644\u0634', 'Mellouleche')
  ON CONFLICT DO NOTHING;

  -- Villes Sfax
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (sfax_id, 'Sakiet Ezzit', '\u0633\u0627\u0642\u064a\u0629 \u0627\u0644\u0632\u064a\u062a', 'Sakiet Ezzit'),
    (sfax_id, 'Sakiet Eddaier', '\u0633\u0627\u0642\u064a\u0629 \u0627\u0644\u062f\u0627\u064a\u0631', 'Sakiet Eddaier'),
    (sfax_id, 'El Ain', '\u0627\u0644\u0639\u064a\u0646', 'El Ain'),
    (sfax_id, 'Thyna', '\u062a\u064a\u0646\u0629', 'Thyna'),
    (sfax_id, 'Agareb', '\u0639\u0642\u0627\u0631\u0628', 'Agareb'),
    (sfax_id, 'Jebiniana', '\u062c\u0628\u064a\u0646\u064a\u0627\u0646\u0629', 'Jebiniana')
  ON CONFLICT DO NOTHING;

  -- Villes Bizerte
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (bizerte_id, 'Menzel Bourguiba', '\u0645\u0646\u0632\u0644 \u0628\u0648\u0631\u0642\u064a\u0628\u0629', 'Menzel Bourguiba'),
    (bizerte_id, 'Menzel Jemil', '\u0645\u0646\u0632\u0644 \u062c\u0645\u064a\u0644', 'Menzel Jemil'),
    (bizerte_id, 'Mateur', '\u0645\u0627\u0637\u0631', 'Mateur'),
    (bizerte_id, 'Ras Jebel', '\u0631\u0623\u0633 \u0627\u0644\u062c\u0628\u0644', 'Ras Jebel')
  ON CONFLICT DO NOTHING;

  -- Villes Kairouan
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (kairouan_id, 'El Ala', '\u0627\u0644\u0639\u0644\u0627', 'El Ala'),
    (kairouan_id, 'Haffouz', '\u062d\u0641\u0648\u0632', 'Haffouz'),
    (kairouan_id, 'Sbikha', '\u0633\u0628\u064a\u062e\u0629', 'Sbikha')
  ON CONFLICT DO NOTHING;

  -- Villes Gab\u00e8s
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gabes_id, 'Mareth', '\u0645\u0627\u0631\u062b', 'Mareth'),
    (gabes_id, 'Matmata', '\u0645\u0637\u0645\u0627\u0637\u0629', 'Matmata'),
    (gabes_id, 'M\u00e9touia', '\u0627\u0644\u0645\u0637\u0648\u064a\u0629', 'Metouia')
  ON CONFLICT DO NOTHING;

  -- Villes M\u00e9denine
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (medenine_id, 'Ben Gardane', '\u0628\u0646 \u0642\u0631\u062f\u0627\u0646', 'Ben Gardane'),
    (medenine_id, 'Jerba Houmt Souk', '\u062c\u0631\u0628\u0629 \u062d\u0648\u0645\u0629 \u0627\u0644\u0633\u0648\u0642', 'Jerba Houmt Souk'),
    (medenine_id, 'Jerba Midoun', '\u062c\u0631\u0628\u0629 \u0645\u064a\u062f\u0648\u0646', 'Jerba Midoun'),
    (medenine_id, 'Zarzis', '\u062c\u0631\u062c\u064a\u0633', 'Zarzis')
  ON CONFLICT DO NOTHING;

END $$;

-- ============================================================
-- SECTION 3 : INDEX DE PERFORMANCE
-- ============================================================

-- Index pour recherche par gouvernorat
CREATE INDEX IF NOT EXISTS idx_businesses_governorate
  ON businesses(governorate_id);

-- Index pour recherche par ville
CREATE INDEX IF NOT EXISTS idx_businesses_city
  ON businesses(city_id);

-- Index pour recherche par cat\u00e9gorie
CREATE INDEX IF NOT EXISTS idx_businesses_category
  ON businesses(category_id);

-- Index spatial pour recherche g\u00e9ographique
CREATE INDEX IF NOT EXISTS idx_businesses_location
  ON businesses USING GIST(location);

-- Index sur latitude/longitude
CREATE INDEX IF NOT EXISTS idx_businesses_lat_lng
  ON businesses(latitude, longitude);

-- Index combin\u00e9 ville + cat\u00e9gorie (recherche fr\u00e9quente)
CREATE INDEX IF NOT EXISTS idx_businesses_city_category
  ON businesses(city_id, category_id);

-- Index sur le texte city (pour compatibilit\u00e9 backwards)
CREATE INDEX IF NOT EXISTS idx_businesses_city_text
  ON businesses(city);

-- Index sur le texte category (pour compatibilit\u00e9 backwards)
CREATE INDEX IF NOT EXISTS idx_businesses_category_text
  ON businesses(category);

-- ============================================================
-- SECTION 4 : MISE \u00c0 JOUR VUE RECHERCHE G\u00c9N\u00c9RALE
-- ============================================================

-- Supprimer l'ancienne vue si elle existe
DROP VIEW IF EXISTS vue_recherche_generale CASCADE;

-- Cr\u00e9er la nouvelle vue avec toutes les informations
CREATE OR REPLACE VIEW vue_recherche_generale AS
SELECT 
  b.id,
  b.name,
  b.description,
  b.address,
  b.phone,
  b.email,
  b.website,
  b.image_url,
  b.status,
  
  -- Informations g\u00e9ographiques (texte)
  b.city AS city_text,
  
  -- Informations ville (relation)
  c.id AS city_id,
  c.name_fr AS city_name_fr,
  c.name_ar AS city_name_ar,
  c.name_en AS city_name_en,
  
  -- Informations gouvernorat
  g.id AS governorate_id,
  g.name_fr AS governorate_name_fr,
  g.name_ar AS governorate_name_ar,
  g.name_en AS governorate_name_en,
  
  -- Informations cat\u00e9gorie (texte)
  b.category AS category_text,
  
  -- Informations cat\u00e9gorie (relation)
  cat.id AS category_id,
  cat.name_fr AS category_name_fr,
  cat.name_ar AS category_name_ar,
  cat.name_en AS category_name_en,
  cat.slug AS category_slug,
  cat.icon AS category_icon,
  
  -- Coordonn\u00e9es GPS
  b.latitude,
  b.longitude,
  b.location,
  
  -- Vecteur de recherche
  b.search_vector,
  
  -- Dates
  b.created_at,
  b.updated_at

FROM businesses b
LEFT JOIN cities c ON b.city_id = c.id
LEFT JOIN governorates g ON b.governorate_id = g.id
LEFT JOIN categories cat ON b.category_id = cat.id

WHERE b.status = 'approved';

-- Commentaire sur la vue
COMMENT ON VIEW vue_recherche_generale IS 
'Vue unifi\u00e9e pour la recherche g\u00e9n\u00e9rale avec informations g\u00e9ographiques et cat\u00e9gorielles compl\u00e8tes';

-- ============================================================
-- SECTION 5 : FONCTIONS UTILITAIRES
-- ============================================================

-- Fonction pour rechercher par rayon (distance en km)
CREATE OR REPLACE FUNCTION search_businesses_by_radius(
  p_latitude numeric,
  p_longitude numeric,
  p_radius_km numeric
)
RETURNS TABLE (
  id uuid,
  name text,
  city_name text,
  governorate_name text,
  category_name text,
  distance_km numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    c.name_fr AS city_name,
    g.name_fr AS governorate_name,
    cat.name_fr AS category_name,
    ROUND(
      ST_Distance(
        b.location::geography,
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
      ) / 1000,
      2
    ) AS distance_km
  FROM businesses b
  LEFT JOIN cities c ON b.city_id = c.id
  LEFT JOIN governorates g ON b.governorate_id = g.id
  LEFT JOIN categories cat ON b.category_id = cat.id
  WHERE 
    b.location IS NOT NULL
    AND b.status = 'approved'
    AND ST_DWithin(
      b.location::geography,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$;

-- Fonction pour obtenir les villes par gouvernorat
CREATE OR REPLACE FUNCTION get_cities_by_governorate(p_governorate_name_fr text)
RETURNS TABLE (
  id uuid,
  name_fr text,
  name_ar text,
  name_en text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name_fr,
    c.name_ar,
    c.name_en
  FROM cities c
  INNER JOIN governorates g ON c.governorate_id = g.id
  WHERE g.name_fr = p_governorate_name_fr
  ORDER BY c.name_fr;
END;
$$;

-- Fonction pour obtenir les statistiques par gouvernorat
CREATE OR REPLACE FUNCTION get_businesses_stats_by_governorate()
RETURNS TABLE (
  governorate_name text,
  total_businesses bigint,
  approved_businesses bigint,
  pending_businesses bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.name_fr AS governorate_name,
    COUNT(*) AS total_businesses,
    COUNT(*) FILTER (WHERE b.status = 'approved') AS approved_businesses,
    COUNT(*) FILTER (WHERE b.status = 'pending') AS pending_businesses
  FROM businesses b
  INNER JOIN governorates g ON b.governorate_id = g.id
  GROUP BY g.name_fr
  ORDER BY total_businesses DESC;
END;
$$;

-- ============================================================
-- SECTION 6 : TRIGGERS AUTO-REMPLISSAGE
-- ============================================================

-- Trigger pour remplir automatiquement governorate_id et city_id
-- bas\u00e9 sur les champs texte city et category
CREATE OR REPLACE FUNCTION auto_fill_geographic_references()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remplir city_id bas\u00e9 sur le nom de ville (texte)
  IF NEW.city IS NOT NULL AND NEW.city_id IS NULL THEN
    SELECT id INTO NEW.city_id
    FROM cities
    WHERE name_fr ILIKE NEW.city
       OR name_ar = NEW.city
       OR name_en ILIKE NEW.city
    LIMIT 1;
  END IF;

  -- Remplir governorate_id bas\u00e9 sur city_id
  IF NEW.city_id IS NOT NULL AND NEW.governorate_id IS NULL THEN
    SELECT governorate_id INTO NEW.governorate_id
    FROM cities
    WHERE id = NEW.city_id;
  END IF;

  -- Remplir category_id bas\u00e9 sur le nom de cat\u00e9gorie (texte)
  IF NEW.category IS NOT NULL AND NEW.category_id IS NULL THEN
    SELECT id INTO NEW.category_id
    FROM categories
    WHERE name_fr ILIKE NEW.category
       OR name_ar = NEW.category
       OR name_en ILIKE NEW.category
       OR slug = NEW.category
    LIMIT 1;
  END IF;

  -- Remplir location bas\u00e9 sur latitude/longitude
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL AND NEW.location IS NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;

  -- Remplir latitude/longitude bas\u00e9 sur location
  IF NEW.location IS NOT NULL AND (NEW.latitude IS NULL OR NEW.longitude IS NULL) THEN
    NEW.latitude := ST_Y(NEW.location::geometry);
    NEW.longitude := ST_X(NEW.location::geometry);
  END IF;

  RETURN NEW;
END;
$$;

-- Appliquer le trigger sur INSERT et UPDATE
DROP TRIGGER IF EXISTS trigger_auto_fill_references ON businesses;
CREATE TRIGGER trigger_auto_fill_references
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION auto_fill_geographic_references();

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================

/*
  R\u00c9SUM\u00c9 DES AM\u00c9LIORATIONS :

  \u2705 Colonnes ajout\u00e9es : governorate_id, city_id, category_id, location, latitude, longitude
  \u2705 50+ villes suppl\u00e9mentaires ajout\u00e9es (Total : 150+)
  \u2705 8 index de performance cr\u00e9\u00e9s
  \u2705 Vue vue_recherche_generale mise \u00e0 jour
  \u2705 3 fonctions SQL utilitaires cr\u00e9\u00e9es
  \u2705 Trigger auto-remplissage cr\u00e9\u00e9

  CAPACIT\u00c9S AJOUT\u00c9ES :
  - Recherche par gouvernorat
  - Recherche par ville (ID ou nom)
  - Recherche par cat\u00e9gorie (ID ou nom)
  - Recherche g\u00e9ographique par rayon (GPS)
  - Recherche combin\u00e9e (ville + cat\u00e9gorie)
  - Statistiques par gouvernorat
  - Auto-remplissage des r\u00e9f\u00e9rences

  TOTAL :
  - 24 gouvernorats \u2705
  - 150+ villes \u2705
  - 10 cat\u00e9gories \u2705
  - 8 index \u2705
  - 1 vue \u2705
  - 3 fonctions SQL \u2705
  - 1 trigger \u2705
*/
