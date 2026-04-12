/*
  # Ajout des coordonnées géographiques aux villes tunisiennes

  1. Modifications
    - Ajout des colonnes `latitude` et `longitude` à la table `cities`
    - Population des coordonnées pour les principales villes de Tunisie
    - Création d'un index spatial pour optimiser les recherches géographiques

  2. Objectif
    - Permettre la géolocalisation et la recherche de la ville la plus proche
    - Supporter la fonctionnalité "Utiliser ma position" dans le moteur de recherche

  3. Notes
    - Coordonnées basées sur les centres-villes des principales agglomérations
    - Précision : 7 décimales (environ 1 cm de précision)
*/

-- Ajouter les colonnes de coordonnées géographiques
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE cities ADD COLUMN latitude numeric(10,7);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE cities ADD COLUMN longitude numeric(10,7);
  END IF;
END $$;

-- Mettre à jour les coordonnées des villes principales
-- Gouvernorat de Tunis
UPDATE cities SET latitude = 36.8065, longitude = 10.1815 WHERE name_fr = 'Tunis' AND latitude IS NULL;
UPDATE cities SET latitude = 36.8189, longitude = 10.1658 WHERE name_fr = 'La Marsa' AND latitude IS NULL;
UPDATE cities SET latitude = 36.8672, longitude = 10.3255 WHERE name_fr = 'Carthage' AND latitude IS NULL;
UPDATE cities SET latitude = 36.8524, longitude = 10.1933 WHERE name_fr = 'Sidi Bou Said' AND latitude IS NULL;

-- Gouvernorat d'Ariana
UPDATE cities SET latitude = 36.8625, longitude = 10.1956 WHERE name_fr = 'Ariana' AND latitude IS NULL;
UPDATE cities SET latitude = 36.9083, longitude = 10.1872 WHERE name_fr = 'La Soukra' AND latitude IS NULL;
UPDATE cities SET latitude = 36.8542, longitude = 10.2217 WHERE name_fr = 'Raoued' AND latitude IS NULL;

-- Gouvernorat de Ben Arous
UPDATE cities SET latitude = 36.7475, longitude = 10.2186 WHERE name_fr = 'Ben Arous' AND latitude IS NULL;
UPDATE cities SET latitude = 36.7000, longitude = 10.3000 WHERE name_fr = 'Hammam-Lif' AND latitude IS NULL;
UPDATE cities SET latitude = 36.6833, longitude = 10.3167 WHERE name_fr = 'Radès' AND latitude IS NULL;

-- Gouvernorat de Manouba
UPDATE cities SET latitude = 36.8092, longitude = 10.0964 WHERE name_fr = 'Manouba' AND latitude IS NULL;
UPDATE cities SET latitude = 36.8311, longitude = 10.0456 WHERE name_fr = 'Denden' AND latitude IS NULL;

-- Gouvernorat de Nabeul
UPDATE cities SET latitude = 36.4561, longitude = 10.7367 WHERE name_fr = 'Nabeul' AND latitude IS NULL;
UPDATE cities SET latitude = 36.4003, longitude = 10.5833 WHERE name_fr = 'Hammamet' AND latitude IS NULL;
UPDATE cities SET latitude = 36.2975, longitude = 10.6994 WHERE name_fr = 'Grombalia' AND latitude IS NULL;
UPDATE cities SET latitude = 36.5750, longitude = 10.7167 WHERE name_fr = 'Kelibia' AND latitude IS NULL;
UPDATE cities SET latitude = 36.8500, longitude = 11.1000 WHERE name_fr = 'Korba' AND latitude IS NULL;

-- Gouvernorat de Zaghouan
UPDATE cities SET latitude = 36.4028, longitude = 10.1428 WHERE name_fr = 'Zaghouan' AND latitude IS NULL;

-- Gouvernorat de Bizerte
UPDATE cities SET latitude = 37.2746, longitude = 9.8739 WHERE name_fr = 'Bizerte' AND latitude IS NULL;
UPDATE cities SET latitude = 37.1667, longitude = 9.7167 WHERE name_fr = 'Menzel Bourguiba' AND latitude IS NULL;
UPDATE cities SET latitude = 37.0833, longitude = 9.8333 WHERE name_fr = 'Mateur' AND latitude IS NULL;

-- Gouvernorat de Béja
UPDATE cities SET latitude = 36.7256, longitude = 9.1817 WHERE name_fr = 'Béja' AND latitude IS NULL;
UPDATE cities SET latitude = 36.5833, longitude = 9.0500 WHERE name_fr = 'Medjez el-Bab' AND latitude IS NULL;

-- Gouvernorat de Jendouba
UPDATE cities SET latitude = 36.5011, longitude = 8.7803 WHERE name_fr = 'Jendouba' AND latitude IS NULL;
UPDATE cities SET latitude = 36.4167, longitude = 8.7667 WHERE name_fr = 'Tabarka' AND latitude IS NULL;

-- Gouvernorat du Kef
UPDATE cities SET latitude = 36.1742, longitude = 8.7050 WHERE name_fr = 'Le Kef' AND latitude IS NULL;

-- Gouvernorat de Siliana
UPDATE cities SET latitude = 36.0847, longitude = 9.3706 WHERE name_fr = 'Siliana' AND latitude IS NULL;

-- Gouvernorat de Kairouan
UPDATE cities SET latitude = 35.6781, longitude = 10.0963 WHERE name_fr = 'Kairouan' AND latitude IS NULL;

-- Gouvernorat de Kasserine
UPDATE cities SET latitude = 35.1675, longitude = 8.8361 WHERE name_fr = 'Kasserine' AND latitude IS NULL;

-- Gouvernorat de Sidi Bouzid
UPDATE cities SET latitude = 35.0381, longitude = 9.4858 WHERE name_fr = 'Sidi Bouzid' AND latitude IS NULL;

-- Gouvernorat de Sousse
UPDATE cities SET latitude = 35.8256, longitude = 10.6369 WHERE name_fr = 'Sousse' AND latitude IS NULL;
UPDATE cities SET latitude = 35.6792, longitude = 10.8311 WHERE name_fr = 'Msaken' AND latitude IS NULL;
UPDATE cities SET latitude = 35.6667, longitude = 10.5833 WHERE name_fr = 'Kalaa Kebira' AND latitude IS NULL;
UPDATE cities SET latitude = 35.7333, longitude = 10.7000 WHERE name_fr = 'Kalaa Seghira' AND latitude IS NULL;

-- Gouvernorat de Monastir
UPDATE cities SET latitude = 35.7775, longitude = 10.8264 WHERE name_fr = 'Monastir' AND latitude IS NULL;
UPDATE cities SET latitude = 35.7256, longitude = 10.7550 WHERE name_fr = 'Moknine' AND latitude IS NULL;
UPDATE cities SET latitude = 35.6800, longitude = 10.9500 WHERE name_fr = 'Ksar Hellal' AND latitude IS NULL;

-- Gouvernorat de Mahdia
UPDATE cities SET latitude = 35.5047, longitude = 11.0622 WHERE name_fr = 'Mahdia' AND latitude IS NULL;
UPDATE cities SET latitude = 35.4833, longitude = 11.0167 WHERE name_fr = 'Ksour Essef' AND latitude IS NULL;

-- Gouvernorat de Sfax
UPDATE cities SET latitude = 34.7400, longitude = 10.7600 WHERE name_fr = 'Sfax' AND latitude IS NULL;
UPDATE cities SET latitude = 34.6333, longitude = 10.5667 WHERE name_fr = 'Sakiet Ezzit' AND latitude IS NULL;

-- Gouvernorat de Gafsa
UPDATE cities SET latitude = 34.4250, longitude = 8.7842 WHERE name_fr = 'Gafsa' AND latitude IS NULL;
UPDATE cities SET latitude = 34.3833, longitude = 8.6667 WHERE name_fr = 'Metlaoui' AND latitude IS NULL;

-- Gouvernorat de Tozeur
UPDATE cities SET latitude = 33.9197, longitude = 8.1339 WHERE name_fr = 'Tozeur' AND latitude IS NULL;
UPDATE cities SET latitude = 33.8833, longitude = 7.9333 WHERE name_fr = 'Nefta' AND latitude IS NULL;

-- Gouvernorat de Kébili
UPDATE cities SET latitude = 33.7069, longitude = 8.9686 WHERE name_fr = 'Kébili' AND latitude IS NULL;
UPDATE cities SET latitude = 33.6667, longitude = 9.0167 WHERE name_fr = 'Douz' AND latitude IS NULL;

-- Gouvernorat de Gabès
UPDATE cities SET latitude = 33.8815, longitude = 10.0982 WHERE name_fr = 'Gabès' AND latitude IS NULL;
UPDATE cities SET latitude = 33.8833, longitude = 10.1000 WHERE name_fr = 'Mareth' AND latitude IS NULL;

-- Gouvernorat de Médenine
UPDATE cities SET latitude = 33.3547, longitude = 10.5053 WHERE name_fr = 'Médenine' AND latitude IS NULL;
UPDATE cities SET latitude = 33.8078, longitude = 10.8456 WHERE name_fr = 'Djerba' AND latitude IS NULL;
UPDATE cities SET latitude = 33.8667, longitude = 10.8500 WHERE name_fr = 'Houmt Souk' AND latitude IS NULL;
UPDATE cities SET latitude = 33.5000, longitude = 10.7000 WHERE name_fr = 'Zarzis' AND latitude IS NULL;

-- Gouvernorat de Tataouine
UPDATE cities SET latitude = 32.9297, longitude = 10.4517 WHERE name_fr = 'Tataouine' AND latitude IS NULL;

-- Créer un index pour améliorer les performances des recherches géographiques
CREATE INDEX IF NOT EXISTS idx_cities_coordinates 
  ON cities(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Créer une fonction pour trouver la ville la plus proche
CREATE OR REPLACE FUNCTION find_nearest_city(
  user_lat numeric,
  user_lng numeric,
  max_results integer DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  name_fr text,
  name_ar text,
  name_en text,
  latitude numeric,
  longitude numeric,
  distance_km numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name_fr,
    c.name_ar,
    c.name_en,
    c.latitude,
    c.longitude,
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(c.latitude)) * 
        cos(radians(c.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(c.latitude))
      )
    )::numeric(10,2) as distance_km
  FROM cities c
  WHERE c.latitude IS NOT NULL 
    AND c.longitude IS NOT NULL
  ORDER BY distance_km
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
