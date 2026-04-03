-- =============================================================================
-- MIGRATION: Normalisation de la colonne request_type
-- =============================================================================
--
-- CONTEXTE:
-- La table partner_requests contient actuellement des valeurs incohérentes
-- dans la colonne request_type : 'unknown', 'offer', 'need', etc.
--
-- OBJECTIF:
-- Normaliser toutes les valeurs pour avoir uniquement :
-- - 'need' : pour les besoins partenaires / recherche de fournisseurs
-- - 'offer' : pour les offres de services / prestataires
--
-- USAGE:
-- Exécutez ces requêtes dans l'ordre dans votre console Supabase SQL Editor
-- ou via psql/pgAdmin.
--
-- =============================================================================

-- 📊 ÉTAPE 1: AUDIT - Voir l'état actuel des données
-- =============================================================================

-- Afficher le nombre de lignes par type de requête
SELECT
  request_type,
  COUNT(*) AS nb,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM partner_requests), 1) AS pourcentage
FROM partner_requests
GROUP BY request_type
ORDER BY nb DESC;

-- Afficher quelques exemples de chaque type
SELECT
  request_type,
  company_name,
  description,
  created_at
FROM partner_requests
ORDER BY request_type, created_at DESC
LIMIT 20;


-- =============================================================================
-- 🔧 ÉTAPE 2: NORMALISATION DES DONNÉES
-- =============================================================================

-- 2.1 - Corriger les valeurs 'unknown' basées sur le contexte
-- -----------------------------------------------------------------------------
-- Stratégie: Analyser la description pour déterminer s'il s'agit d'un besoin
-- ou d'une offre. Par défaut, on suppose que c'est un besoin.

-- Option A: Marquer comme 'need' si la description contient des mots-clés de besoin
UPDATE partner_requests
SET request_type = 'need'
WHERE request_type = 'unknown'
  AND (
    description ILIKE '%besoin%'
    OR description ILIKE '%recherche%'
    OR description ILIKE '%cherche%'
    OR description ILIKE '%demande%'
    OR description ILIKE '%partenaire%'
    OR description ILIKE '%fournisseur%'
    OR search_type ILIKE '%partner%'
    OR search_type ILIKE '%besoin%'
  );

-- Option B: Marquer comme 'offer' si la description contient des mots-clés d'offre
UPDATE partner_requests
SET request_type = 'offer'
WHERE request_type = 'unknown'
  AND (
    description ILIKE '%offre%'
    OR description ILIKE '%propose%'
    OR description ILIKE '%service%'
    OR description ILIKE '%prestataire%'
    OR description ILIKE '%expertise%'
    OR profile_type = 'provider'
    OR search_type = 'offer'
  );

-- Option C: Marquer le reste comme 'need' par défaut
UPDATE partner_requests
SET request_type = 'need'
WHERE request_type = 'unknown' OR request_type IS NULL;


-- 2.2 - Normaliser les anciennes valeurs vers le nouveau système
-- -----------------------------------------------------------------------------

-- Convertir 'entreprise_besoin' -> 'need'
UPDATE partner_requests
SET request_type = 'need'
WHERE request_type IN ('entreprise_besoin', 'partner_need', 'business_need');

-- Convertir 'prestataire_service' -> 'offer'
UPDATE partner_requests
SET request_type = 'offer'
WHERE request_type IN ('prestataire_service', 'service_provider', 'provider');

-- Convertir 'offre' -> 'offer'
UPDATE partner_requests
SET request_type = 'offer'
WHERE request_type = 'offre';


-- =============================================================================
-- 📊 ÉTAPE 3: VÉRIFICATION POST-MIGRATION
-- =============================================================================

-- Afficher la distribution après migration
SELECT
  request_type,
  COUNT(*) AS nb,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM partner_requests), 1) AS pourcentage
FROM partner_requests
GROUP BY request_type
ORDER BY nb DESC;

-- Vérifier qu'il n'y a plus de valeurs 'unknown' ou NULL
SELECT COUNT(*) AS nb_unknown
FROM partner_requests
WHERE request_type = 'unknown' OR request_type IS NULL;

-- Si le résultat est 0, la migration est réussie ✅


-- =============================================================================
-- 🔒 ÉTAPE 4: CONTRAINTE (OPTIONNEL)
-- =============================================================================
--
-- Si vous voulez empêcher l'insertion de valeurs invalides à l'avenir,
-- vous pouvez ajouter une contrainte CHECK sur la table :

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE partner_requests DROP CONSTRAINT IF EXISTS check_request_type;

-- Ajouter une nouvelle contrainte pour accepter uniquement 'need' ou 'offer'
ALTER TABLE partner_requests
ADD CONSTRAINT check_request_type
CHECK (request_type IN ('need', 'offer'));

-- ⚠️ ATTENTION: Cette contrainte empêchera l'insertion de NULL
-- Si vous voulez autoriser NULL, modifiez comme suit:
-- CHECK (request_type IS NULL OR request_type IN ('need', 'offer'))


-- =============================================================================
-- 📝 NOTES FINALES
-- =============================================================================
--
-- 1. BACKUP: Assurez-vous d'avoir une sauvegarde avant d'exécuter cette migration
--
-- 2. ROLLBACK: Si vous devez annuler la migration, vous pouvez restaurer depuis
--    votre backup ou créer un script de rollback basé sur vos données spécifiques.
--
-- 3. TESTS: Après la migration, testez les filtres dans l'interface admin:
--    - Onglet "Tous" doit afficher toutes les demandes
--    - Onglet "Besoins partenaires" doit afficher uniquement request_type='need'
--    - Onglet "Prestataires / services" doit afficher uniquement request_type='offer'
--
-- 4. LOGS: Vérifiez les logs dans la console du navigateur:
--    [PartnerRequestsAdmin] 🔎 Types de requêtes présents: ['need', 'offer']
--    [PartnerRequestsAdmin] 🧮 Filtre actif: need
--    [PartnerRequestsAdmin] ✅ Nombre de demandes affichées: X
--
-- =============================================================================
