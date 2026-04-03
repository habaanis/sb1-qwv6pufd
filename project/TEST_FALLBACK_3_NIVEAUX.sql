-- ═══════════════════════════════════════════════════════════════════════════
-- 🧪 SCRIPT DE TEST - Système de Fallback à 3 Niveaux
-- ═══════════════════════════════════════════════════════════════════════════
-- Ce script crée 12 entreprises de test pour vérifier que le système utilise
-- la bonne priorité de colonnes: statut_abonnement → type_abonnement → subscription_tier
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 🧹 ÉTAPE 1: Nettoyage (supprimer les anciennes entreprises de test)
-- ───────────────────────────────────────────────────────────────────────────

DELETE FROM entreprise WHERE nom LIKE 'TEST P%';

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 SECTION 1: TESTS DE PRIORITÉ 1 (statut_abonnement)
-- ═══════════════════════════════════════════════════════════════════════════

-- ⚫ TEST P1-1: Elite Pro (Priorité 1)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P1 Elite',
  'entreprise', 'Services', 'Tunis', 'Tunis', '71111001',
  'Test Priorité 1: statut_abonnement = elite_pro',
  'elite_pro', NULL, NULL
);
-- Résultat attendu: ⚫ Carte NOIRE + Badge "P1: elite_pro"

-- 🟣 TEST P1-2: Artisan (Priorité 1)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P1 Artisan',
  'entreprise', 'Artisanat', 'Sousse', 'Sousse', '73111002',
  'Test Priorité 1: statut_abonnement = artisan',
  'artisan', NULL, NULL
);
-- Résultat attendu: 🟣 Carte MAUVE + Badge "P1: artisan"

-- 🟢 TEST P1-3: Premium (Priorité 1)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P1 Premium',
  'entreprise', 'Commerce', 'Sfax', 'Sfax', '74111003',
  'Test Priorité 1: statut_abonnement = premium',
  'premium', NULL, NULL
);
-- Résultat attendu: 🟢 Carte VERTE + Badge "P1: premium"

-- ⚪ TEST P1-4: Gratuit (Priorité 1)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P1 Gratuit',
  'entreprise', 'Autre', 'Bizerte', 'Bizerte', '72111004',
  'Test Priorité 1: statut_abonnement = gratuit',
  'gratuit', NULL, NULL
);
-- Résultat attendu: ⚪ Carte BLANCHE + Badge "P1: gratuit"

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 SECTION 2: TESTS DE PRIORITÉ 2 (type_abonnement en fallback)
-- ═══════════════════════════════════════════════════════════════════════════

-- ⚫ TEST P2-1: Elite Pro (Priorité 2)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P2 Elite',
  'entreprise', 'Services', 'Tunis', 'La Marsa', '71222001',
  'Test Priorité 2: type_abonnement = elite_pro (P1 vide)',
  NULL, 'elite_pro', 'artisan'
);
-- Résultat attendu: ⚫ Carte NOIRE + Badge "P2: elite_pro"
-- Note: subscription_tier est ignoré car type_abonnement existe

-- 🟣 TEST P2-2: Artisan (Priorité 2)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P2 Artisan',
  'entreprise', 'Artisanat', 'Sousse', 'Monastir', '73222002',
  'Test Priorité 2: type_abonnement = artisan (P1 vide)',
  NULL, 'artisan', 'premium'
);
-- Résultat attendu: 🟣 Carte MAUVE + Badge "P2: artisan"

-- 🟢 TEST P2-3: Premium (Priorité 2)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P2 Premium',
  'entreprise', 'Commerce', 'Sfax', 'Sfax Ville', '74222003',
  'Test Priorité 2: type_abonnement = premium (P1 vide)',
  NULL, 'premium', 'elite_pro'
);
-- Résultat attendu: 🟢 Carte VERTE + Badge "P2: premium"

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 SECTION 3: TESTS DE PRIORITÉ 3 (subscription_tier en fallback)
-- ═══════════════════════════════════════════════════════════════════════════

-- ⚫ TEST P3-1: Elite Pro (Priorité 3)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P3 Elite',
  'entreprise', 'Services', 'Tunis', 'Ariana', '71333001',
  'Test Priorité 3: subscription_tier = elite_pro (P1 et P2 vides)',
  NULL, NULL, 'elite_pro'
);
-- Résultat attendu: ⚫ Carte NOIRE + Badge "P3: elite_pro"

-- 🟣 TEST P3-2: Artisan (Priorité 3)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P3 Artisan',
  'entreprise', 'Artisanat', 'Sousse', 'Kalaa Kebira', '73333002',
  'Test Priorité 3: subscription_tier = artisan (P1 et P2 vides)',
  NULL, NULL, 'artisan'
);
-- Résultat attendu: 🟣 Carte MAUVE + Badge "P3: artisan"

-- 🟢 TEST P3-3: Premium (Priorité 3)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P3 Premium',
  'entreprise', 'Commerce', 'Sfax', 'Sakiet Eddaier', '74333003',
  'Test Priorité 3: subscription_tier = premium (P1 et P2 vides)',
  NULL, NULL, 'premium'
);
-- Résultat attendu: 🟢 Carte VERTE + Badge "P3: premium"

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 SECTION 4: TEST AUCUNE COLONNE REMPLIE
-- ═══════════════════════════════════════════════════════════════════════════

-- ⚪ TEST P0: Aucune colonne
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone, description,
  statut_abonnement, type_abonnement, subscription_tier
) VALUES (
  'TEST P0 Découverte',
  'entreprise', 'Autre', 'Bizerte', 'Bizerte Nord', '72000000',
  'Test: Toutes les colonnes vides',
  NULL, NULL, NULL
);
-- Résultat attendu: ⚪ Carte BLANCHE sans badge premium

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 SECTION 5: TESTS DE VARIANTES DE NOMMAGE
-- ═══════════════════════════════════════════════════════════════════════════

-- Ces tests vérifient que le système détecte les variantes avec majuscules, espaces, etc.

-- Test: Majuscules
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  statut_abonnement
) VALUES (
  'TEST Variante Majuscule',
  'entreprise', 'Services', 'Tunis', 'Tunis', '71444001',
  'ELITE PRO'
);
-- Résultat attendu: ⚫ Carte NOIRE (détection malgré majuscules)

-- Test: Underscores
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  type_abonnement
) VALUES (
  'TEST Variante Underscore',
  'entreprise', 'Services', 'Sousse', 'Sousse', '73444002',
  'elite_pro'
);
-- Résultat attendu: ⚫ Carte NOIRE (P2: elite_pro)

-- Test: Espaces
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  subscription_tier
) VALUES (
  'TEST Variante Espaces',
  'entreprise', 'Services', 'Sfax', 'Sfax', '74444003',
  '  elite pro  '
);
-- Résultat attendu: ⚫ Carte NOIRE (P3: elite pro avec espaces)

-- ───────────────────────────────────────────────────────────────────────────
-- 📊 ÉTAPE 2: Vérifier que les données ont été insérées correctement
-- ───────────────────────────────────────────────────────────────────────────

SELECT
  nom,
  statut_abonnement as p1,
  type_abonnement as p2,
  subscription_tier as p3,
  CASE
    WHEN statut_abonnement IS NOT NULL THEN '✅ P1'
    WHEN type_abonnement IS NOT NULL THEN '⚠️ P2'
    WHEN subscription_tier IS NOT NULL THEN '⚠️ P3'
    ELSE '❌ P0'
  END as priorite_utilisee,
  COALESCE(statut_abonnement, type_abonnement, subscription_tier, 'null') as valeur_finale,
  CASE
    WHEN COALESCE(statut_abonnement, type_abonnement, subscription_tier, '') ILIKE '%elite%'
      OR COALESCE(statut_abonnement, type_abonnement, subscription_tier, '') ILIKE '%pro%' THEN '⚫ Noir'
    WHEN COALESCE(statut_abonnement, type_abonnement, subscription_tier, '') ILIKE '%artisan%' THEN '🟣 Mauve'
    WHEN COALESCE(statut_abonnement, type_abonnement, subscription_tier, '') ILIKE '%premium%' THEN '🟢 Vert'
    ELSE '⚪ Blanc'
  END as couleur_attendue
FROM entreprise
WHERE nom LIKE 'TEST P%'
ORDER BY nom;

-- ───────────────────────────────────────────────────────────────────────────
-- 🎯 RÉSULTAT ATTENDU:
-- ───────────────────────────────────────────────────────────────────────────
-- | nom                      | p1        | p2        | p3        | priorite | valeur_finale | couleur    |
-- |--------------------------|-----------|-----------|-----------|----------|---------------|------------|
-- | TEST P0 Découverte       | NULL      | NULL      | NULL      | ❌ P0    | null          | ⚪ Blanc   |
-- | TEST P1 Artisan          | artisan   | NULL      | NULL      | ✅ P1    | artisan       | 🟣 Mauve   |
-- | TEST P1 Elite            | elite_pro | NULL      | NULL      | ✅ P1    | elite_pro     | ⚫ Noir    |
-- | TEST P1 Gratuit          | gratuit   | NULL      | NULL      | ✅ P1    | gratuit       | ⚪ Blanc   |
-- | TEST P1 Premium          | premium   | NULL      | NULL      | ✅ P1    | premium       | 🟢 Vert    |
-- | TEST P2 Artisan          | NULL      | artisan   | premium   | ⚠️ P2    | artisan       | 🟣 Mauve   |
-- | TEST P2 Elite            | NULL      | elite_pro | artisan   | ⚠️ P2    | elite_pro     | ⚫ Noir    |
-- | TEST P2 Premium          | NULL      | premium   | elite_pro | ⚠️ P2    | premium       | 🟢 Vert    |
-- | TEST P3 Artisan          | NULL      | NULL      | artisan   | ⚠️ P3    | artisan       | 🟣 Mauve   |
-- | TEST P3 Elite            | NULL      | NULL      | elite_pro | ⚠️ P3    | elite_pro     | ⚫ Noir    |
-- | TEST P3 Premium          | NULL      | NULL      | premium   | ⚠️ P3    | premium       | 🟢 Vert    |
-- | TEST Variante Espaces    | NULL      | NULL      | elite pro | ⚠️ P3    | elite pro     | ⚫ Noir    |
-- | TEST Variante Majuscule  | ELITE PRO | NULL      | NULL      | ✅ P1    | ELITE PRO     | ⚫ Noir    |
-- | TEST Variante Underscore | NULL      | elite_pro | NULL      | ⚠️ P2    | elite_pro     | ⚫ Noir    |
-- ───────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 📝 INSTRUCTIONS DE TEST
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 1. Exécutez ce script dans l'éditeur SQL de Supabase
--
-- 2. Vérifiez que 15 lignes ont été insérées avec la requête SELECT ci-dessus
--
-- 3. Allez sur la page /entreprises de votre application
--
-- 4. Ouvrez la console (F12) et cherchez les logs:
--
--    [fetchBusinesses] 📊 Colonnes abonnement: {
--      nom: "TEST P1 Elite",
--      statut_abonnement: "elite_pro",
--      type_abonnement: null,
--      subscription_tier: null
--    }
--
--    [CompanyCard TEST P1 Elite] {
--      source: "✅ P1: statut_abonnement",
--      statut_abonnement: "elite_pro",
--      type_abonnement: null,
--      subscription_tier: null,
--      statutFinal: "elite_pro"
--    }
--
--    [CompanyCard TEST P1 Elite] → tier="elite", bg="#121212"
--
-- 5. Vérifiez visuellement les cartes (activer ENABLE_TIER_DEBUG = true):
--    - Cartes P1 : Badge affiche "P1: [valeur]"
--    - Cartes P2 : Badge affiche "P2: [valeur]"
--    - Cartes P3 : Badge affiche "P3: [valeur]"
--    - Carte P0  : Pas de badge premium
--
-- 6. Vérifiez que les couleurs correspondent:
--    - Elite/Pro → ⚫ Carte NOIRE
--    - Artisan   → 🟣 Carte MAUVE
--    - Premium   → 🟢 Carte VERTE
--    - Gratuit   → ⚪ Carte BLANCHE
--
-- 7. Pour nettoyer après les tests:
--    DELETE FROM entreprise WHERE nom LIKE 'TEST P%';
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 🔬 TEST BONUS: Vérifier les conflits de priorité
-- ───────────────────────────────────────────────────────────────────────────

-- Cette requête trouve les entreprises avec plusieurs colonnes remplies
SELECT
  nom,
  statut_abonnement,
  type_abonnement,
  subscription_tier,
  CASE
    WHEN statut_abonnement IS NOT NULL THEN '✅ P1 gagne'
    WHEN type_abonnement IS NOT NULL THEN '⚠️ P2 gagne'
    ELSE '⚠️ P3 gagne'
  END as priorite_gagnante
FROM entreprise
WHERE nom LIKE 'TEST P2%'
ORDER BY nom;

-- Résultat attendu: Toutes les cartes P2 doivent afficher la valeur de type_abonnement,
-- même si subscription_tier contient une autre valeur

-- ───────────────────────────────────────────────────────────────────────────
-- 📊 STATISTIQUES: Répartition des priorités
-- ───────────────────────────────────────────────────────────────────────────

SELECT
  CASE
    WHEN statut_abonnement IS NOT NULL THEN '✅ Priorité 1 (statut_abonnement)'
    WHEN type_abonnement IS NOT NULL THEN '⚠️ Priorité 2 (type_abonnement)'
    WHEN subscription_tier IS NOT NULL THEN '⚠️ Priorité 3 (subscription_tier)'
    ELSE '❌ Aucune colonne'
  END as source,
  COUNT(*) as nombre
FROM entreprise
WHERE secteur = 'entreprise'
GROUP BY source
ORDER BY
  CASE
    WHEN statut_abonnement IS NOT NULL THEN 1
    WHEN type_abonnement IS NOT NULL THEN 2
    WHEN subscription_tier IS NOT NULL THEN 3
    ELSE 4
  END;

-- Cette requête vous montre combien d'entreprises utilisent chaque priorité
-- En production, vous devriez voir principalement "Priorité 1"

-- ───────────────────────────────────────────────────────────────────────────
-- 🧪 TEST SIMULATION WHALESYNC
-- ───────────────────────────────────────────────────────────────────────────

-- Scénario: Une entreprise a type_abonnement rempli, puis Whalesync synchronise statut_abonnement

-- Étape 1: État initial (avant Whalesync)
INSERT INTO entreprise (
  nom, secteur, sous_categories, gouvernorat, ville, telephone,
  statut_abonnement, type_abonnement
) VALUES (
  'TEST Whalesync Avant',
  'entreprise', 'Services', 'Tunis', 'Tunis', '71999998',
  NULL, 'artisan'
);
-- → L'app affiche une carte 🟣 MAUVE avec badge "P2: artisan"

-- Vérifier l'état initial
SELECT nom, statut_abonnement, type_abonnement,
  CASE
    WHEN statut_abonnement IS NOT NULL THEN 'P1'
    WHEN type_abonnement IS NOT NULL THEN 'P2'
    ELSE 'P0'
  END as priorite
FROM entreprise
WHERE nom = 'TEST Whalesync Avant';

-- Étape 2: Whalesync synchronise statut_abonnement
UPDATE entreprise
SET statut_abonnement = 'elite_pro'
WHERE nom = 'TEST Whalesync Avant';
-- → L'app affiche maintenant une carte ⚫ NOIRE avec badge "P1: elite_pro"

-- Vérifier l'état après synchronisation
SELECT nom, statut_abonnement, type_abonnement,
  CASE
    WHEN statut_abonnement IS NOT NULL THEN 'P1 ✅'
    WHEN type_abonnement IS NOT NULL THEN 'P2 ⚠️'
    ELSE 'P0 ❌'
  END as priorite
FROM entreprise
WHERE nom = 'TEST Whalesync Avant';
-- Résultat: P1 ✅ (statut_abonnement = 'elite_pro', type_abonnement = 'artisan')

-- Étape 3: Nettoyer
DELETE FROM entreprise WHERE nom = 'TEST Whalesync Avant';

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT DE TEST
-- ═══════════════════════════════════════════════════════════════════════════

-- 💡 REMARQUE IMPORTANTE:
-- Le système de fallback à 3 niveaux garantit que l'application affiche toujours
-- une couleur correcte, même si Whalesync n'a pas encore synchronisé statut_abonnement.
--
-- ORDRE DE PRIORITÉ (du plus important au moins important):
-- 1. statut_abonnement (source Whalesync/Airtable) ✅
-- 2. type_abonnement (fallback si P1 vide)        ⚠️
-- 3. subscription_tier (fallback si P1 et P2 vides) ⚠️
--
-- Si aucune colonne n'est remplie → Carte blanche (découverte) ⚪
