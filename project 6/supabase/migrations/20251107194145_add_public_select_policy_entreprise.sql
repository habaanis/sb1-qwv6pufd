-- Ajout d'une policy SELECT pour les utilisateurs anonymes
-- 
-- Problème : La policy actuelle ne permet l'accès qu'aux entreprises avec status = 'approved'
-- Solution : Étendre la policy pour inclure aussi status = 'active'
-- 
-- Sécurité : Les utilisateurs anonymes peuvent voir les entreprises actives et approuvées

-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Public can read approved entreprise" ON entreprise;

-- Créer une nouvelle policy étendue
CREATE POLICY "Public can read active and approved entreprise"
  ON entreprise
  FOR SELECT
  TO public
  USING (status IN ('active', 'approved'));

COMMENT ON POLICY "Public can read active and approved entreprise" ON entreprise IS 'Permet aux utilisateurs anonymes et authentifiés de voir les entreprises actives et approuvées';
