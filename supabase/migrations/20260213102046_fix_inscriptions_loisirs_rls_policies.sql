/*
  # Correction des politiques RLS pour inscriptions_loisirs

  ## 1. Contexte
    La table inscriptions_loisirs a RLS activé mais AUCUNE politique définie,
    ce qui bloque toutes les opérations (SELECT, INSERT, UPDATE, DELETE).

  ## 2. Politiques créées
    
    ### SELECT (Lecture publique)
    - Tous les utilisateurs (authentifiés et anonymes) peuvent lire les données
    - USING (true) : Aucune restriction
    
    ### INSERT (Insertion publique)
    - Tous les utilisateurs (authentifiés et anonymes) peuvent insérer
    - WITH CHECK (true) : Aucune restriction
    - Permet la soumission du formulaire sans connexion
    
    ### UPDATE (Modification restreinte)
    - Seuls les utilisateurs authentifiés peuvent modifier
    - USING (true) : Accès à toutes les lignes
    - Réservé pour l'administration future
    
    ### DELETE (Suppression restreinte)
    - Seuls les utilisateurs authentifiés peuvent supprimer
    - USING (true) : Accès à toutes les lignes
    - Réservé pour l'administration

  ## 3. Sécurité
    - Les données sont publiquement lisibles (pour affichage sur le site)
    - Les insertions sont publiques (formulaire de proposition accessible à tous)
    - Les modifications et suppressions nécessitent une authentification
    - Future évolution : restreindre UPDATE/DELETE aux admins uniquement

  ## 4. Notes importantes
    - Ces politiques sont permissives pour faciliter la contribution citoyenne
    - La validation se fait côté admin via le champ statut_whalesync
    - Les données soumises sont vérifiées avant publication
*/

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Lecture publique des inscriptions loisirs" ON inscriptions_loisirs;
DROP POLICY IF EXISTS "Insertions publiques autorisées" ON inscriptions_loisirs;
DROP POLICY IF EXISTS "Modifications autorisées" ON inscriptions_loisirs;
DROP POLICY IF EXISTS "Suppressions restreintes" ON inscriptions_loisirs;

-- Politique SELECT: Lecture publique pour tous
CREATE POLICY "Lecture publique des inscriptions loisirs"
  ON inscriptions_loisirs
  FOR SELECT
  TO public
  USING (true);

-- Politique INSERT: Insertions publiques autorisées (anonymes et authentifiés)
CREATE POLICY "Insertions publiques autorisées"
  ON inscriptions_loisirs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Politique UPDATE: Modifications réservées aux utilisateurs authentifiés
CREATE POLICY "Modifications autorisées"
  ON inscriptions_loisirs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique DELETE: Suppressions réservées aux utilisateurs authentifiés
CREATE POLICY "Suppressions restreintes"
  ON inscriptions_loisirs
  FOR DELETE
  TO authenticated
  USING (true);
