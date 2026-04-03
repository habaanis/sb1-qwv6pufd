-- Script de test pour vérifier le système de tiers d'abonnement
-- Copiez et exécutez ce script dans l'éditeur SQL de Supabase

-- 🧪 PARTIE 1: Créer des entreprises de test avec différents tiers

-- 1. Entreprise de test ARTISAN (Mauve & Or)
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  email,
  description,
  statut_abonnement
) VALUES (
  'TEST Artisan Mauve',
  'entreprise',
  'Artisanat',
  'Tunis',
  'Tunis',
  '71123456',
  'artisan@test.com',
  'Entreprise de test pour vérifier le tier Artisan avec fond mauve et bordure dorée',
  'artisan'
) ON CONFLICT DO NOTHING;

-- 2. Entreprise de test PREMIUM (Vert & Or)
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  email,
  description,
  statut_abonnement
) VALUES (
  'TEST Premium Vert',
  'entreprise',
  'Services',
  'Tunis',
  'Tunis',
  '71123457',
  'premium@test.com',
  'Entreprise de test pour vérifier le tier Premium avec fond vert et bordure dorée',
  'premium'
) ON CONFLICT DO NOTHING;

-- 3. Entreprise de test ELITE (Noir & Or)
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  email,
  description,
  statut_abonnement
) VALUES (
  'TEST Elite Pro Noir',
  'entreprise',
  'Finance',
  'Tunis',
  'Tunis',
  '71123458',
  'elite@test.com',
  'Entreprise de test pour vérifier le tier Elite Pro avec fond noir et bordure dorée',
  'Elite Pro'
) ON CONFLICT DO NOTHING;

-- 4. Entreprise de test ELITE (format underscore)
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  email,
  description,
  statut_abonnement
) VALUES (
  'TEST Elite Underscore',
  'entreprise',
  'Finance',
  'Tunis',
  'Tunis',
  '71123459',
  'elite2@test.com',
  'Entreprise de test pour vérifier le tier Elite avec format elite_pro',
  'elite_pro'
) ON CONFLICT DO NOTHING;

-- 5. Entreprise de test DECOUVERTE (Gris & Or)
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  email,
  description,
  statut_abonnement
) VALUES (
  'TEST Découverte Gris',
  'entreprise',
  'Commerce',
  'Tunis',
  'Tunis',
  '71123460',
  'decouverte@test.com',
  'Entreprise de test pour vérifier le tier Découverte avec fond gris clair et bordure dorée fine',
  NULL
) ON CONFLICT DO NOTHING;

-- 🧪 PARTIE 2: Vérifier les entreprises existantes

-- Afficher toutes les entreprises avec leur statut d'abonnement
SELECT
  id,
  nom,
  statut_abonnement,
  subscription_tier,
  is_premium,
  CASE
    WHEN statut_abonnement IS NULL THEN 'DECOUVERTE (par défaut)'
    WHEN LOWER(statut_abonnement) LIKE '%elite%' OR LOWER(statut_abonnement) LIKE '%pro%' THEN 'ELITE (Noir & Or)'
    WHEN LOWER(statut_abonnement) LIKE '%premium%' THEN 'PREMIUM (Vert & Or)'
    WHEN LOWER(statut_abonnement) LIKE '%artisan%' THEN 'ARTISAN (Mauve & Or)'
    ELSE 'DECOUVERTE (fallback)'
  END as tier_detecte
FROM entreprise
WHERE secteur = 'entreprise'
ORDER BY
  CASE
    WHEN LOWER(statut_abonnement) LIKE '%elite%' THEN 1
    WHEN LOWER(statut_abonnement) LIKE '%premium%' THEN 2
    WHEN LOWER(statut_abonnement) LIKE '%artisan%' THEN 3
    ELSE 4
  END,
  nom;

-- 🧪 PARTIE 3: Statistiques des tiers

SELECT
  CASE
    WHEN statut_abonnement IS NULL THEN 'DECOUVERTE'
    WHEN LOWER(statut_abonnement) LIKE '%elite%' OR LOWER(statut_abonnement) LIKE '%pro%' THEN 'ELITE'
    WHEN LOWER(statut_abonnement) LIKE '%premium%' THEN 'PREMIUM'
    WHEN LOWER(statut_abonnement) LIKE '%artisan%' THEN 'ARTISAN'
    ELSE 'AUTRE'
  END as tier,
  COUNT(*) as nombre_entreprises,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM entreprise WHERE secteur = 'entreprise'), 2) as pourcentage
FROM entreprise
WHERE secteur = 'entreprise'
GROUP BY
  CASE
    WHEN statut_abonnement IS NULL THEN 'DECOUVERTE'
    WHEN LOWER(statut_abonnement) LIKE '%elite%' OR LOWER(statut_abonnement) LIKE '%pro%' THEN 'ELITE'
    WHEN LOWER(statut_abonnement) LIKE '%premium%' THEN 'PREMIUM'
    WHEN LOWER(statut_abonnement) LIKE '%artisan%' THEN 'ARTISAN'
    ELSE 'AUTRE'
  END
ORDER BY nombre_entreprises DESC;

-- 🧪 PARTIE 4: Modifier une entreprise existante pour tester le rafraîchissement

-- ⚠️ CHOISISSEZ UNE ENTREPRISE RÉELLE ET REMPLACEZ 'votre-id-ici' PAR SON ID RÉEL

-- Test 1: Passer une entreprise en ARTISAN
-- UPDATE entreprise
-- SET statut_abonnement = 'artisan'
-- WHERE id = 'votre-id-ici';

-- Test 2: Passer une entreprise en PREMIUM
-- UPDATE entreprise
-- SET statut_abonnement = 'premium'
-- WHERE id = 'votre-id-ici';

-- Test 3: Passer une entreprise en ELITE PRO (plusieurs formats)
-- UPDATE entreprise
-- SET statut_abonnement = 'Elite Pro'
-- WHERE id = 'votre-id-ici';

-- Test 4: Tester les variations de casse et espaces
-- UPDATE entreprise
-- SET statut_abonnement = '  PREMIUM  '
-- WHERE id = 'votre-id-ici';

-- 🧪 PARTIE 5: Nettoyer les entreprises de test (à exécuter après vos tests)

-- DELETE FROM entreprise WHERE nom LIKE 'TEST %';

-- 📊 NOTES IMPORTANTES:
--
-- 1. Après chaque UPDATE, rechargez la page /entreprises dans votre navigateur
-- 2. Ouvrez la console (F12) pour voir les logs de debug
-- 3. Cherchez les lignes [fetchBusinesses] et [SignatureCard]
-- 4. Vérifiez le badge debug en haut à gauche de chaque carte
-- 5. Les couleurs doivent changer immédiatement après le refresh
--
-- Couleurs attendues :
-- - DECOUVERTE : Fond gris clair (#F8FAFC), bordure or fine
-- - ARTISAN : Fond mauve (#4A1D43), bordure or épaisse
-- - PREMIUM : Fond vert (#064E3B), bordure or épaisse
-- - ELITE : Fond noir (#121212), bordure or épaisse
