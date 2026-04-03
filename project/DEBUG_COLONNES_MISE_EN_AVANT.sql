-- ============================================================
-- DEBUG : Vérification des colonnes "mise en avant pub" et "page_commerce_local"
-- ============================================================

-- 1. Vérifier l'existence et le type des colonnes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name IN ('mise en avant pub', 'page_commerce_local', 'page commerce local');

-- ============================================================
-- 2. Vérifier les valeurs distinctes dans "mise en avant pub"
SELECT
    "mise en avant pub" as valeur,
    pg_typeof("mise en avant pub") as type_pg,
    COUNT(*) as nombre
FROM entreprise
GROUP BY "mise en avant pub"
ORDER BY nombre DESC;

-- ============================================================
-- 3. Vérifier les valeurs distinctes dans "page_commerce_local"
SELECT
    page_commerce_local as valeur,
    pg_typeof(page_commerce_local) as type_pg,
    COUNT(*) as nombre
FROM entreprise
GROUP BY page_commerce_local
ORDER BY nombre DESC;

-- ============================================================
-- 4. Tester différents filtres pour "mise en avant pub"
-- Test 1: Avec .eq('"mise en avant pub"', true)
SELECT
    id,
    nom,
    "mise en avant pub",
    pg_typeof("mise en avant pub") as type_colonne
FROM entreprise
WHERE "mise en avant pub" = true
LIMIT 5;

-- Test 2: Si la valeur est stockée comme text 'true'
SELECT
    id,
    nom,
    "mise en avant pub",
    pg_typeof("mise en avant pub") as type_colonne
FROM entreprise
WHERE "mise en avant pub"::text = 'true'
LIMIT 5;

-- Test 3: Avec IS TRUE
SELECT
    id,
    nom,
    "mise en avant pub",
    pg_typeof("mise en avant pub") as type_colonne
FROM entreprise
WHERE "mise en avant pub" IS TRUE
LIMIT 5;

-- ============================================================
-- 5. Tester différents filtres pour "page_commerce_local"
-- Test 1: Avec .eq('page_commerce_local', true)
SELECT
    id,
    nom,
    page_commerce_local,
    pg_typeof(page_commerce_local) as type_colonne
FROM entreprise
WHERE page_commerce_local = true
LIMIT 5;

-- ============================================================
-- 6. Afficher un échantillon complet avec toutes les colonnes
SELECT
    id,
    nom,
    "mise en avant pub",
    page_commerce_local,
    statut_abonnement,
    "niveau priorité abonnement"
FROM entreprise
WHERE "mise en avant pub" IS NOT NULL
   OR page_commerce_local IS NOT NULL
ORDER BY "niveau priorité abonnement" DESC NULLS LAST
LIMIT 10;

-- ============================================================
-- 7. Compter le nombre total par catégorie
SELECT
    COUNT(*) FILTER (WHERE "mise en avant pub" = true) as mise_en_avant_count,
    COUNT(*) FILTER (WHERE page_commerce_local = true) as commerce_local_count,
    COUNT(*) FILTER (WHERE "mise en avant pub" IS NULL) as mise_en_avant_null,
    COUNT(*) FILTER (WHERE page_commerce_local IS NULL) as commerce_local_null,
    COUNT(*) as total_entreprises
FROM entreprise;

-- ============================================================
-- 8. Vérifier les index existants sur ces colonnes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'entreprise'
AND (indexdef ILIKE '%mise en avant pub%' OR indexdef ILIKE '%page_commerce_local%');
