/*
  Script : Remplissage des coordonnées GPS manquantes

  Objectif : Ajouter des coordonnées GPS pour toutes les entreprises
             qui n'en ont pas, en utilisant le centre du gouvernorat

  Résultat attendu : Les 246 entreprises sans GPS auront une position
                     approximative pour afficher la carte

  Durée : < 1 seconde
*/

-- Mise à jour des entreprises sans coordonnées GPS
-- en utilisant le centre du gouvernorat comme fallback

UPDATE entreprise
SET
  latitude = CASE gouvernorat
    -- Grand Tunis
    WHEN 'Tunis' THEN 36.806389
    WHEN 'Ariana' THEN 36.860000
    WHEN 'Ben Arous' THEN 36.747222
    WHEN 'Manouba' THEN 36.810000

    -- Nord-Est
    WHEN 'Nabeul' THEN 36.456111
    WHEN 'Zaghouan' THEN 36.402778
    WHEN 'Bizerte' THEN 37.274444

    -- Nord-Ouest
    WHEN 'Béja' THEN 36.725556
    WHEN 'Jendouba' THEN 36.501389
    WHEN 'Kef' THEN 36.174167
    WHEN 'Siliana' THEN 36.084722

    -- Centre-Est
    WHEN 'Sousse' THEN 35.825278
    WHEN 'Monastir' THEN 35.777500
    WHEN 'Mahdia' THEN 35.504722
    WHEN 'Sfax' THEN 34.740833

    -- Centre-Ouest
    WHEN 'Kairouan' THEN 35.678889
    WHEN 'Kasserine' THEN 35.167222
    WHEN 'Sidi Bouzid' THEN 35.038056

    -- Sud-Est
    WHEN 'Gabès' THEN 33.881389
    WHEN 'Medenine' THEN 33.354167
    WHEN 'Tataouine' THEN 32.929722

    -- Sud-Ouest
    WHEN 'Gafsa' THEN 34.425000
    WHEN 'Tozeur' THEN 33.919722
    WHEN 'Kébili' THEN 33.705556
  END,

  longitude = CASE gouvernorat
    -- Grand Tunis
    WHEN 'Tunis' THEN 10.181667
    WHEN 'Ariana' THEN 10.195556
    WHEN 'Ben Arous' THEN 10.219167
    WHEN 'Manouba' THEN 10.096667

    -- Nord-Est
    WHEN 'Nabeul' THEN 10.735278
    WHEN 'Zaghouan' THEN 10.143056
    WHEN 'Bizerte' THEN 9.873889

    -- Nord-Ouest
    WHEN 'Béja' THEN 9.181667
    WHEN 'Jendouba' THEN 8.780556
    WHEN 'Kef' THEN 8.704722
    WHEN 'Siliana' THEN 9.370278

    -- Centre-Est
    WHEN 'Sousse' THEN 10.634722
    WHEN 'Monastir' THEN 10.826389
    WHEN 'Mahdia' THEN 11.062222
    WHEN 'Sfax' THEN 10.760833

    -- Centre-Ouest
    WHEN 'Kairouan' THEN 10.096944
    WHEN 'Kasserine' THEN 8.830556
    WHEN 'Sidi Bouzid' THEN 9.484722

    -- Sud-Est
    WHEN 'Gabès' THEN 10.098333
    WHEN 'Medenine' THEN 10.505556
    WHEN 'Tataouine' THEN 10.451944

    -- Sud-Ouest
    WHEN 'Gafsa' THEN 8.784167
    WHEN 'Tozeur' THEN 8.133333
    WHEN 'Kébili' THEN 8.969167
  END

WHERE
  -- Seulement les entreprises sans GPS
  (latitude IS NULL OR longitude IS NULL)
  -- Et qui ont un gouvernorat
  AND gouvernorat IS NOT NULL;


-- Vérification du résultat
SELECT
  'Résultat du remplissage GPS' as operation,
  COUNT(*) as total_entreprises,
  COUNT(latitude) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as avec_gps,
  COUNT(*) FILTER (WHERE latitude IS NULL OR longitude IS NULL) as sans_gps,
  ROUND(
    COUNT(latitude) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) * 100.0 / COUNT(*),
    2
  ) as pourcentage_gps
FROM entreprise;


-- Liste des gouvernorats couverts
SELECT
  gouvernorat,
  COUNT(*) as nombre_entreprises,
  COUNT(latitude) FILTER (WHERE latitude IS NOT NULL) as avec_gps
FROM entreprise
GROUP BY gouvernorat
ORDER BY nombre_entreprises DESC;
