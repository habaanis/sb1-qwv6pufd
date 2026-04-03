-- ============================================================================
-- SCRIPT DE DÉMONSTRATION - Système de Tiers d'Abonnement Dynamique
-- ============================================================================
-- Ce script permet de tester visuellement les différents tiers d'abonnement
-- en créant ou mettant à jour des entreprises avec chaque tier.
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : Vérifier la structure actuelle
-- ============================================================================

-- Afficher toutes les entreprises avec leur tier actuel
SELECT
  id,
  nom,
  ville,
  categories,
  subscription_tier,
  is_premium,
  CASE
    WHEN subscription_tier IN ('artisan', 'premium', 'elite', 'elite_pro') THEN '✓ PREMIUM'
    ELSE '○ GRATUIT'
  END as statut
FROM entreprise
ORDER BY subscription_tier DESC, nom
LIMIT 20;

-- Compter les entreprises par tier
SELECT
  COALESCE(subscription_tier, 'NULL') as tier,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM entreprise
GROUP BY subscription_tier
ORDER BY total DESC;

-- ============================================================================
-- ÉTAPE 2 : Créer des entreprises de démonstration (si nécessaire)
-- ============================================================================

-- ⚠️ Décommenter les lignes ci-dessous pour créer des entreprises de test

/*
-- Exemple DÉCOUVERTE (Gratuit)
INSERT INTO entreprise (nom, ville, categories, description, telephone, subscription_tier, is_premium)
VALUES (
  'Restaurant La Mamma - DEMO',
  'Tunis',
  'Restaurant, Italien',
  'Restaurant italien traditionnel au cœur de Tunis. Spécialités de pâtes fraîches et pizzas au feu de bois.',
  '+216 71 123 456',
  'gratuit',
  false
);

-- Exemple ARTISAN (Mauve Premium)
INSERT INTO entreprise (nom, ville, categories, description, telephone, email, site_web, subscription_tier, is_premium)
VALUES (
  'Café des Délices - DEMO',
  'Sidi Bou Said',
  'Café, Restaurant',
  'Café emblématique de Sidi Bou Said avec vue panoramique sur la mer Méditerranée.',
  '+216 71 234 567',
  'contact@cafedelices-demo.tn',
  'https://cafedelices-demo.tn',
  'artisan',
  true
);

-- Exemple PREMIUM (Vert Émeraude)
INSERT INTO entreprise (nom, ville, categories, description, telephone, email, site_web, subscription_tier, is_premium)
VALUES (
  'Hôtel Dar Yasmine - DEMO',
  'Hammamet',
  'Hôtellerie, Spa, Restaurant',
  'Hôtel de luxe 5 étoiles avec spa, restaurant gastronomique et accès direct à la plage.',
  '+216 72 345 678',
  'reservation@daryasmine-demo.tn',
  'https://daryasmine-demo.tn',
  'premium',
  true
);

-- Exemple ÉLITE PRO (Anthracite)
INSERT INTO entreprise (nom, ville, categories, description, telephone, email, site_web, subscription_tier, is_premium)
VALUES (
  'Cabinet Juridique Ben Salah & Associés - DEMO',
  'Tunis',
  'Services Juridiques, Conseil',
  'Cabinet d''avocats international spécialisé en droit des affaires et fiscalité.',
  '+216 71 456 789',
  'contact@bensalah-demo.tn',
  'https://bensalah-demo.tn',
  'elite',
  true
);

-- Exemple CUSTOM (Sur-mesure)
INSERT INTO entreprise (nom, ville, categories, description, telephone, subscription_tier)
VALUES (
  'Entreprise Solutions Personnalisées - DEMO',
  'Sfax',
  'Services B2B, Conseil',
  'Solutions sur-mesure pour entreprises.',
  '+216 74 567 890',
  'custom'
);
*/

-- ============================================================================
-- ÉTAPE 3 : Mettre à jour des entreprises existantes pour démonstration
-- ============================================================================

-- ⚠️ Décommenter et adapter selon vos besoins

/*
-- Passer 3 restaurants en tier Artisan
UPDATE entreprise
SET subscription_tier = 'artisan', is_premium = true
WHERE categories ILIKE '%restaurant%'
  AND subscription_tier = 'gratuit'
LIMIT 3;

-- Passer 2 hôtels en tier Premium
UPDATE entreprise
SET subscription_tier = 'premium', is_premium = true
WHERE categories ILIKE '%hôtel%'
  OR categories ILIKE '%hotel%'
  AND subscription_tier = 'gratuit'
LIMIT 2;

-- Passer 1 cabinet professionnel en tier Elite
UPDATE entreprise
SET subscription_tier = 'elite', is_premium = true
WHERE (categories ILIKE '%cabinet%' OR categories ILIKE '%avocat%' OR categories ILIKE '%conseil%')
  AND subscription_tier = 'gratuit'
LIMIT 1;
*/

-- ============================================================================
-- ÉTAPE 4 : Vérifier les mises à jour
-- ============================================================================

-- Afficher un échantillon de chaque tier
SELECT
  subscription_tier as tier,
  nom,
  ville,
  categories,
  CASE
    WHEN subscription_tier = 'gratuit' OR subscription_tier = 'decouverte'
      THEN 'Gris clair #F8FAFC'
    WHEN subscription_tier = 'artisan'
      THEN 'Mauve Premium #4A1D43'
    WHEN subscription_tier = 'premium'
      THEN 'Vert Émeraude #064E3B'
    WHEN subscription_tier = 'elite' OR subscription_tier = 'elite_pro'
      THEN 'Anthracite #121212'
    WHEN subscription_tier = 'custom'
      THEN 'Gris Custom #F9FAFB'
    ELSE 'Non défini'
  END as couleur_carte
FROM entreprise
WHERE subscription_tier IN ('gratuit', 'artisan', 'premium', 'elite', 'custom')
ORDER BY
  CASE subscription_tier
    WHEN 'elite' THEN 1
    WHEN 'elite_pro' THEN 1
    WHEN 'premium' THEN 2
    WHEN 'artisan' THEN 3
    WHEN 'custom' THEN 4
    WHEN 'gratuit' THEN 5
    WHEN 'decouverte' THEN 5
    ELSE 6
  END,
  nom
LIMIT 10;

-- ============================================================================
-- ÉTAPE 5 : Statistiques finales
-- ============================================================================

-- Distribution des tiers avec couleurs
SELECT
  CASE
    WHEN subscription_tier = 'gratuit' OR subscription_tier = 'decouverte'
      THEN '🔵 Découverte (Gratuit)'
    WHEN subscription_tier = 'artisan'
      THEN '🟣 Artisan (Mauve)'
    WHEN subscription_tier = 'premium'
      THEN '🟢 Premium (Vert)'
    WHEN subscription_tier = 'elite' OR subscription_tier = 'elite_pro'
      THEN '⚫ Élite Pro (Anthracite)'
    WHEN subscription_tier = 'custom'
      THEN '⚪ Custom (Sur-mesure)'
    ELSE '❓ Non défini'
  END as tier_visuel,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM entreprise
GROUP BY
  CASE
    WHEN subscription_tier = 'gratuit' OR subscription_tier = 'decouverte' THEN 1
    WHEN subscription_tier = 'artisan' THEN 2
    WHEN subscription_tier = 'premium' THEN 3
    WHEN subscription_tier = 'elite' OR subscription_tier = 'elite_pro' THEN 4
    WHEN subscription_tier = 'custom' THEN 5
    ELSE 6
  END,
  CASE
    WHEN subscription_tier = 'gratuit' OR subscription_tier = 'decouverte'
      THEN '🔵 Découverte (Gratuit)'
    WHEN subscription_tier = 'artisan'
      THEN '🟣 Artisan (Mauve)'
    WHEN subscription_tier = 'premium'
      THEN '🟢 Premium (Vert)'
    WHEN subscription_tier = 'elite' OR subscription_tier = 'elite_pro'
      THEN '⚫ Élite Pro (Anthracite)'
    WHEN subscription_tier = 'custom'
      THEN '⚪ Custom (Sur-mesure)'
    ELSE '❓ Non défini'
  END
ORDER BY 1;

-- Résumé des entreprises premium vs gratuites
SELECT
  CASE
    WHEN subscription_tier IN ('artisan', 'premium', 'elite', 'elite_pro')
      THEN '💎 ABONNEMENT PAYANT'
    ELSE '🆓 GRATUIT'
  END as categorie,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM entreprise
GROUP BY
  CASE
    WHEN subscription_tier IN ('artisan', 'premium', 'elite', 'elite_pro') THEN 1
    ELSE 2
  END,
  CASE
    WHEN subscription_tier IN ('artisan', 'premium', 'elite', 'elite_pro')
      THEN '💎 ABONNEMENT PAYANT'
    ELSE '🆓 GRATUIT'
  END
ORDER BY 1;

-- ============================================================================
-- ÉTAPE 6 : Nettoyage (optionnel)
-- ============================================================================

-- ⚠️ Décommenter pour supprimer les entreprises de démonstration

/*
DELETE FROM entreprise
WHERE nom LIKE '%- DEMO';
*/

-- ============================================================================
-- GUIDE D'UTILISATION
-- ============================================================================

/*
1. Exécutez l'ÉTAPE 1 pour voir l'état actuel de vos données

2. Si vous n'avez pas d'entreprises, décommentez et exécutez l'ÉTAPE 2
   pour créer des entreprises de test

3. Si vous avez déjà des entreprises, décommentez et adaptez l'ÉTAPE 3
   pour mettre à jour certaines entreprises existantes

4. Exécutez l'ÉTAPE 4 pour vérifier les résultats

5. Exécutez l'ÉTAPE 5 pour voir les statistiques finales

6. Allez sur votre site web pour voir les cartes avec les nouvelles couleurs :
   - Découverte : Gris clair avec bordure dorée fine
   - Artisan : Mauve profond avec bordure dorée épaisse
   - Premium : Vert émeraude avec bordure dorée épaisse
   - Élite Pro : Anthracite avec bordure dorée épaisse
   - Custom : Gris clair avec bordure pointillée

7. Si besoin, utilisez l'ÉTAPE 6 pour nettoyer les données de test

IMPORTANT : Les styles s'appliquent automatiquement dès que vous modifiez
le champ subscription_tier dans la base de données. Aucun code à modifier !
*/
