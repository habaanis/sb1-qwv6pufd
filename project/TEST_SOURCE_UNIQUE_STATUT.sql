-- ═══════════════════════════════════════════════════════════════════════════
-- 🧪 SCRIPT DE TEST - Source Unique: statut_abonnement
-- ═══════════════════════════════════════════════════════════════════════════
-- Ce script crée 4 entreprises de test pour vérifier que le système utilise
-- UNIQUEMENT la colonne statut_abonnement (synchronisée avec Whalesync).
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 🧹 ÉTAPE 1: Nettoyage (supprimer les anciennes entreprises de test)
-- ───────────────────────────────────────────────────────────────────────────

DELETE FROM entreprise
WHERE nom LIKE 'TEST %';

-- ───────────────────────────────────────────────────────────────────────────
-- ✅ ÉTAPE 2: Créer 4 entreprises de test avec différents tiers
-- ───────────────────────────────────────────────────────────────────────────

-- 🟣 TEST 1: Entreprise avec statut_abonnement = 'artisan'
-- Résultat attendu: Carte MAUVE avec badge "⭐ ARTISAN"
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  description,
  statut_abonnement
) VALUES (
  'TEST Artisan',
  'entreprise',
  'Services',
  'Tunis',
  'Tunis',
  '71001001',
  'Entreprise de test avec statut artisan',
  'artisan'
);

-- 🟢 TEST 2: Entreprise avec statut_abonnement = 'premium'
-- Résultat attendu: Carte VERTE avec badge "⭐ PREMIUM"
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  description,
  statut_abonnement
) VALUES (
  'TEST Premium',
  'entreprise',
  'Commerce',
  'Sousse',
  'Sousse',
  '73001002',
  'Entreprise de test avec statut premium',
  'premium'
);

-- ⚫ TEST 3: Entreprise avec statut_abonnement = 'elite_pro'
-- Résultat attendu: Carte NOIRE avec badge "⭐ ELITE"
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  description,
  statut_abonnement
) VALUES (
  'TEST Elite Pro',
  'entreprise',
  'Industrie',
  'Sfax',
  'Sfax',
  '74001003',
  'Entreprise de test avec statut elite_pro',
  'elite_pro'
);

-- ⚪ TEST 4: Entreprise SANS ABONNEMENT (découverte)
-- Résultat attendu: Carte BLANCHE sans badge premium
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  description
) VALUES (
  'TEST Découverte',
  'entreprise',
  'Autre',
  'Bizerte',
  'Bizerte',
  '72001004',
  'Entreprise de test sans abonnement'
);

-- ───────────────────────────────────────────────────────────────────────────
-- 📊 ÉTAPE 3: Vérifier que les données ont été insérées correctement
-- ───────────────────────────────────────────────────────────────────────────

SELECT
  nom,
  statut_abonnement,
  CASE
    WHEN statut_abonnement = 'artisan' THEN '🟣 Mauve'
    WHEN statut_abonnement = 'premium' THEN '🟢 Vert'
    WHEN statut_abonnement = 'elite_pro' THEN '⚫ Noir'
    ELSE '⚪ Blanc'
  END as couleur_attendue
FROM entreprise
WHERE nom LIKE 'TEST %'
ORDER BY nom;

-- ───────────────────────────────────────────────────────────────────────────
-- 🎯 RÉSULTAT ATTENDU:
-- ───────────────────────────────────────────────────────────────────────────
-- | nom                  | statut_abonnement | couleur_attendue |
-- |----------------------|------------------|------------------|
-- | TEST Artisan         | artisan          | 🟣 Mauve        |
-- | TEST Découverte      | NULL             | ⚪ Blanc        |
-- | TEST Elite Pro       | elite_pro        | ⚫ Noir         |
-- | TEST Premium         | premium          | 🟢 Vert         |
-- ───────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 📝 INSTRUCTIONS DE TEST
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 1. Exécutez ce script dans l'éditeur SQL de Supabase
--
-- 2. Vérifiez que 4 lignes ont été insérées avec la requête SELECT ci-dessus
--
-- 3. Allez sur la page /entreprises de votre application
--
-- 4. Ouvrez la console (F12) et cherchez les logs simplifiés:
--    [fetchBusinesses] ✅ Données récupérées: X entreprises
--    [fetchBusinesses] 📊 statut_abonnement: {
--      nom: "TEST Artisan",
--      statut_abonnement: "artisan"
--    }
--
--    [CompanyCard TEST Artisan] statut_abonnement="artisan" → normalized="artisan"
--
-- 5. Vérifiez visuellement les cartes:
--    - TEST Artisan     → Carte 🟣 MAUVE avec badge ⭐ ARTISAN
--    - TEST Premium     → Carte 🟢 VERTE avec badge ⭐ PREMIUM
--    - TEST Elite Pro   → Carte ⚫ NOIRE avec badge ⭐ ELITE
--    - TEST Découverte  → Carte ⚪ BLANCHE sans badge
--
-- 6. Pour nettoyer après les tests, exécutez:
--    DELETE FROM entreprise WHERE nom LIKE 'TEST %';
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 🔬 TEST BONUS: Vérifier qu'aucune colonne de fallback n'est utilisée
-- ───────────────────────────────────────────────────────────────────────────

-- Cette requête montre que SEULE la colonne statut_abonnement est utilisée
SELECT
  nom,
  statut_abonnement AS source_unique,
  type_abonnement AS ignore_1,
  subscription_tier AS ignore_2,
  CASE
    WHEN statut_abonnement IS NOT NULL THEN '✅ Utilisée'
    ELSE '❌ NULL'
  END as statut
FROM entreprise
WHERE nom LIKE 'TEST %'
ORDER BY nom;

-- Résultat attendu: SEULE la colonne statut_abonnement contient des valeurs
-- Les colonnes type_abonnement et subscription_tier doivent être NULL

-- ───────────────────────────────────────────────────────────────────────────
-- 📊 STATISTIQUES: Répartition des tiers dans toute la base
-- ───────────────────────────────────────────────────────────────────────────

SELECT
  statut_abonnement,
  COUNT(*) as nombre,
  CASE
    WHEN statut_abonnement = 'artisan' THEN '🟣 Mauve'
    WHEN statut_abonnement = 'premium' THEN '🟢 Vert'
    WHEN statut_abonnement = 'elite_pro' THEN '⚫ Noir'
    WHEN statut_abonnement IS NULL THEN '⚪ Blanc'
    ELSE '⚠️ Autre'
  END as couleur
FROM entreprise
WHERE secteur = 'entreprise'
GROUP BY statut_abonnement
ORDER BY nombre DESC;

-- Cette requête vous montre combien d'entreprises ont chaque tier
-- et vous permet de voir si des valeurs inattendues existent

-- ───────────────────────────────────────────────────────────────────────────
-- 🧪 TEST AVANCÉ: Simulation de la synchronisation Whalesync
-- ───────────────────────────────────────────────────────────────────────────

-- Étape 1: Créer une entreprise sans abonnement
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone
) VALUES (
  'TEST Whalesync Simulation',
  'entreprise', 'Services', 'Tunis', 'Tunis', '71999999'
);
-- → L'application affichera une carte BLANCHE (découverte)

-- Étape 2: Attendre quelques secondes, puis simuler la synchronisation Whalesync
-- En production, cette mise à jour serait faite automatiquement par Whalesync
UPDATE entreprise
SET statut_abonnement = 'premium'
WHERE nom = 'TEST Whalesync Simulation';
-- → L'application affichera maintenant une carte VERTE (premium)

-- Vérifier le résultat
SELECT
  nom,
  statut_abonnement,
  CASE
    WHEN statut_abonnement = 'premium' THEN '✅ Synchronisation réussie → Carte VERTE'
    ELSE '❌ Erreur'
  END as resultat
FROM entreprise
WHERE nom = 'TEST Whalesync Simulation';

-- Étape 3: Nettoyer
DELETE FROM entreprise WHERE nom = 'TEST Whalesync Simulation';

-- ───────────────────────────────────────────────────────────────────────────
-- 🔍 VÉRIFICATION FINALE: Colonnes réellement utilisées
-- ───────────────────────────────────────────────────────────────────────────

-- Cette requête montre quelles colonnes contiennent des données
SELECT
  COUNT(*) FILTER (WHERE statut_abonnement IS NOT NULL) as statut_abonnement_count,
  COUNT(*) FILTER (WHERE type_abonnement IS NOT NULL) as type_abonnement_count,
  COUNT(*) FILTER (WHERE subscription_tier IS NOT NULL) as subscription_tier_count,
  COUNT(*) as total
FROM entreprise
WHERE secteur = 'entreprise';

-- Interprétation:
-- - statut_abonnement_count: Nombre d'entreprises avec un tier défini ✅
-- - type_abonnement_count: Doit être 0 ou ignoré (colonnes non utilisées) ⚠️
-- - subscription_tier_count: Doit être 0 ou ignoré (colonnes non utilisées) ⚠️

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT DE TEST
-- ═══════════════════════════════════════════════════════════════════════════

-- 💡 REMARQUE IMPORTANTE:
-- Le système utilise maintenant UNIQUEMENT la colonne statut_abonnement.
-- Les colonnes type_abonnement et subscription_tier sont IGNORÉES par l'application.
-- Seule Whalesync doit mettre à jour la colonne statut_abonnement depuis Airtable.
