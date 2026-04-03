-- ============================================================
-- DEBUG : Vérification des commerces locaux et magasins
-- ============================================================

-- 1. Vérifier les colonnes nécessaires
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'entreprise'
AND column_name IN ('secteur', 'page_commerce_local', 'sous_categories', 'gouvernorat', 'is_premium');

-- ============================================================
-- 2. Compter les entreprises par secteur
SELECT
    secteur,
    COUNT(*) as nombre
FROM entreprise
GROUP BY secteur
ORDER BY nombre DESC;

-- ============================================================
-- 3. Vérifier les entreprises avec page_commerce_local = true
SELECT
    COUNT(*) FILTER (WHERE page_commerce_local = true) as avec_page_commerce,
    COUNT(*) FILTER (WHERE page_commerce_local = false) as sans_page_commerce,
    COUNT(*) FILTER (WHERE page_commerce_local IS NULL) as page_commerce_null,
    COUNT(*) as total
FROM entreprise;

-- ============================================================
-- 4. Vérifier les magasins avec page_commerce_local = true
SELECT
    id,
    nom,
    secteur,
    sous_categories,
    gouvernorat,
    page_commerce_local,
    is_premium
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
LIMIT 10;

-- ============================================================
-- 5. Compter les magasins par gouvernorat
SELECT
    gouvernorat,
    COUNT(*) as nombre_magasins
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
GROUP BY gouvernorat
ORDER BY nombre_magasins DESC;

-- ============================================================
-- 6. Vérifier les sous-catégories de magasins
SELECT
    sous_categories,
    COUNT(*) as nombre
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
GROUP BY sous_categories
ORDER BY nombre DESC
LIMIT 20;

-- ============================================================
-- 7. Test de la requête exacte utilisée dans le code
SELECT
    id,
    nom,
    secteur,
    sous_categories,
    gouvernorat,
    is_premium
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
LIMIT 100;

-- ============================================================
-- 8. Vérifier les magasins premium
SELECT
    id,
    nom,
    gouvernorat,
    is_premium
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
AND is_premium = true
LIMIT 10;

-- ============================================================
-- 9. Simuler une recherche par texte (exemple: "artisanat")
SELECT
    id,
    nom,
    sous_categories,
    gouvernorat
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
AND (nom ILIKE '%artisanat%' OR sous_categories ILIKE '%artisanat%')
LIMIT 10;

-- ============================================================
-- 10. Simuler une recherche par gouvernorat (exemple: "Tunis")
SELECT
    id,
    nom,
    sous_categories,
    gouvernorat
FROM entreprise
WHERE secteur = 'magasin'
AND page_commerce_local = true
AND gouvernorat = 'Tunis'
LIMIT 10;

-- ============================================================
-- DIAGNOSTIC COMPLET
-- ============================================================

-- Si AUCUN résultat dans les requêtes ci-dessus :
-- 1. Vérifier que Whalesync/Zapier synchronise bien les données
-- 2. Vérifier que la colonne 'secteur' contient bien 'magasin' (et non 'Magasin' ou 'magasins')
-- 3. Vérifier que 'page_commerce_local' est bien de type boolean

-- Pour corriger si nécessaire :

-- Créer la colonne si elle n'existe pas
ALTER TABLE entreprise
ADD COLUMN IF NOT EXISTS page_commerce_local boolean DEFAULT false;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_entreprise_secteur_commerce_local
ON entreprise (secteur, page_commerce_local)
WHERE secteur = 'magasin' AND page_commerce_local = true;

-- Mettre à jour les données si nécessaire (exemple)
-- UPDATE entreprise
-- SET page_commerce_local = true
-- WHERE secteur = 'magasin'
-- AND /* vos critères ici */;
