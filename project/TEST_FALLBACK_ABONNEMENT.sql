-- ═══════════════════════════════════════════════════════════════════════════
-- 🧪 SCRIPT DE TEST - Système de Fallback des Abonnements
-- ═══════════════════════════════════════════════════════════════════════════
-- Ce script crée 4 entreprises de test pour vérifier que le système de
-- fallback fonctionne correctement avec les 3 sources de données.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 🧹 ÉTAPE 1: Nettoyage (supprimer les anciennes entreprises de test)
-- ───────────────────────────────────────────────────────────────────────────

DELETE FROM entreprise
WHERE nom LIKE 'TEST FALLBACK %';

-- ───────────────────────────────────────────────────────────────────────────
-- ✅ ÉTAPE 2: Créer 4 entreprises de test avec différentes sources
-- ───────────────────────────────────────────────────────────────────────────

-- 🟣 TEST 1: Entreprise avec "Statut Abonnement" (Whalesync) = ARTISAN
-- Résultat attendu: Carte MAUVE avec badge "✅ Whalesync"
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  description,
  "Statut Abonnement"
) VALUES (
  'TEST FALLBACK 1 - Whalesync Artisan',
  'entreprise',
  'Services',
  'Tunis',
  'Tunis',
  '71123001',
  'Entreprise de test avec donnée Whalesync uniquement',
  'artisan'
);

-- 🟢 TEST 2: Entreprise avec type_abonnement (Fallback) = PREMIUM
-- Résultat attendu: Carte VERTE avec badge "⚠️ Fallback type"
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  description,
  type_abonnement
) VALUES (
  'TEST FALLBACK 2 - Type Premium',
  'entreprise',
  'Commerce',
  'Sousse',
  'Sousse',
  '73123002',
  'Entreprise de test avec fallback type_abonnement',
  'premium'
);

-- ⚫ TEST 3: Entreprise avec subscription_tier (Fallback secondaire) = ELITE
-- Résultat attendu: Carte NOIRE avec badge "⚠️ Fallback tier"
INSERT INTO entreprise (
  nom,
  secteur,
  sous_categories,
  gouvernorat,
  ville,
  telephone,
  description,
  subscription_tier
) VALUES (
  'TEST FALLBACK 3 - Tier Elite',
  'entreprise',
  'Industrie',
  'Sfax',
  'Sfax',
  '74123003',
  'Entreprise de test avec fallback subscription_tier',
  'Elite Pro'
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
  'TEST FALLBACK 4 - Découverte',
  'entreprise',
  'Autre',
  'Bizerte',
  'Bizerte',
  '72123004',
  'Entreprise de test sans aucune donnée d''abonnement'
);

-- ───────────────────────────────────────────────────────────────────────────
-- 📊 ÉTAPE 3: Vérifier que les données ont été insérées correctement
-- ───────────────────────────────────────────────────────────────────────────

SELECT
  nom,
  "Statut Abonnement" as whalesync,
  type_abonnement,
  subscription_tier,
  CASE
    WHEN "Statut Abonnement" IS NOT NULL THEN '✅ Whalesync'
    WHEN type_abonnement IS NOT NULL THEN '⚠️ Fallback type'
    WHEN subscription_tier IS NOT NULL THEN '⚠️ Fallback tier'
    ELSE '❌ Aucune donnée'
  END as source_prioritaire
FROM entreprise
WHERE nom LIKE 'TEST FALLBACK %'
ORDER BY nom;

-- ───────────────────────────────────────────────────────────────────────────
-- 🎯 RÉSULTAT ATTENDU:
-- ───────────────────────────────────────────────────────────────────────────
-- | nom                                  | whalesync | type_ab. | sub_tier | source        |
-- |--------------------------------------|-----------|----------|----------|---------------|
-- | TEST FALLBACK 1 - Whalesync Artisan  | artisan   | NULL     | NULL     | ✅ Whalesync  |
-- | TEST FALLBACK 2 - Type Premium       | NULL      | premium  | NULL     | ⚠️ Fallback type |
-- | TEST FALLBACK 3 - Tier Elite         | NULL      | NULL     | Elite Pro| ⚠️ Fallback tier |
-- | TEST FALLBACK 4 - Découverte         | NULL      | NULL     | NULL     | ❌ Aucune donnée |
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
-- 4. Ouvrez la console (F12) et cherchez les logs:
--    [fetchBusinesses] ✅ Données récupérées de Supabase: X entreprises
--    [CompanyCard TEST FALLBACK 1 - Whalesync Artisan] {
--      statut_abonnement_FINAL: "artisan",
--      source: "✅ Whalesync"
--    }
--
-- 5. Vérifiez visuellement les cartes:
--    - TEST 1 → Carte 🟣 MAUVE avec badge ⭐ ARTISAN
--    - TEST 2 → Carte 🟢 VERTE avec badge ⭐ PREMIUM
--    - TEST 3 → Carte ⚫ NOIRE avec badge ⭐ ELITE
--    - TEST 4 → Carte ⚪ BLANCHE sans badge
--
-- 6. Pour nettoyer après les tests, exécutez:
--    DELETE FROM entreprise WHERE nom LIKE 'TEST FALLBACK %';
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 🔬 TEST AVANCÉ: Simulation de la synchronisation Whalesync
-- ───────────────────────────────────────────────────────────────────────────
-- Ce test simule ce qui se passe quand Whalesync met à jour une entreprise
-- qui utilisait un fallback.
-- ───────────────────────────────────────────────────────────────────────────

-- Étape 1: Créer une entreprise avec fallback type_abonnement
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  type_abonnement
) VALUES (
  'TEST WHALESYNC OVERRIDE',
  'entreprise', 'Services', 'Tunis', 'Tunis', '71999001',
  'premium'
);
-- → L'application affichera une carte VERTE (fallback)

-- Étape 2: Simuler la synchronisation Whalesync qui met à jour l'entreprise
UPDATE entreprise
SET "Statut Abonnement" = 'Elite Pro'
WHERE nom = 'TEST WHALESYNC OVERRIDE';
-- → Maintenant l'application affichera une carte NOIRE (Whalesync prioritaire)

-- Vérifier le résultat
SELECT
  nom,
  "Statut Abonnement" as whalesync,
  type_abonnement,
  CASE
    WHEN "Statut Abonnement" IS NOT NULL THEN '✅ Whalesync (prioritaire)'
    WHEN type_abonnement IS NOT NULL THEN '⚠️ Fallback type'
    ELSE '❌ Aucune donnée'
  END as source_utilisee
FROM entreprise
WHERE nom = 'TEST WHALESYNC OVERRIDE';

-- Résultat attendu:
-- | nom                    | whalesync | type_ab. | source_utilisee         |
-- |------------------------|-----------|----------|-------------------------|
-- | TEST WHALESYNC OVERRIDE| Elite Pro | premium  | ✅ Whalesync (prioritaire)|
--
-- L'application utilise "Elite Pro" de Whalesync et ignore "premium" de type_abonnement
-- → Carte NOIRE affichée ✅

-- ───────────────────────────────────────────────────────────────────────────
-- 🧪 TEST BONUS: Statistiques des sources de données
-- ───────────────────────────────────────────────────────────────────────────

SELECT
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NOT NULL) as whalesync_count,
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NULL AND type_abonnement IS NOT NULL) as fallback_type_count,
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NULL AND type_abonnement IS NULL AND subscription_tier IS NOT NULL) as fallback_tier_count,
  COUNT(*) FILTER (WHERE "Statut Abonnement" IS NULL AND type_abonnement IS NULL AND subscription_tier IS NULL) as no_data_count,
  COUNT(*) as total
FROM entreprise
WHERE secteur = 'entreprise';

-- Ce rapport montre la répartition des sources de données dans votre base
-- et permet d'évaluer la couverture de Whalesync.

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT DE TEST
-- ═══════════════════════════════════════════════════════════════════════════
