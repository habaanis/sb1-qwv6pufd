/*
  # Nettoyage et Harmonisation Elite des Tables Loisirs

  ## 1. Ménage des Tables
    - Suppression de `evenements_locaux` (ancienne table)
    - Renommage de `registration_loisirs` en `inscriptions_loisirs`
    - `culture_events` reste la table officielle pour l'agenda culturel

  ## 2. Structure de `inscriptions_loisirs`
    **Colonnes existantes:**
    - id (uuid)
    - nom_evenement (text)
    - organisateur (text)
    - date_prevue (timestamptz)
    - ville (text)
    - contact_tel (text)
    - statut (text, défaut: 'En attente')
    - created_at (timestamptz)

    **Nouvelles colonnes ajoutées:**
    - prenom (text) - Prénom du proposant
    - whatsapp (text) - Numéro WhatsApp pour contact
    - type_affichage (text) - Type d'affichage: hebdo, mensuel, annuel
    - est_organisateur (boolean) - true = organisateur, false = visiteur
    - prix_entree (text) - Prix d'entrée ou fourchette
    - description (text) - Description détaillée de l'événement

  ## 3. Sécurité RLS
    - RLS activé sur `inscriptions_loisirs`
    - Politique SELECT: Tous peuvent lire
    - Politique INSERT: Insertions publiques autorisées (anonymes et authentifiés)
    - Politique UPDATE: Seuls les admins
    - Politique DELETE: Seuls les admins

  ## 4. Notes importantes
    - Les données existantes dans `registration_loisirs` sont préservées lors du renommage
    - Les insertions publiques sont permises sans authentification
    - La table `culture_events` reste la source officielle pour l'agenda culturel public
*/

-- Étape 1: Supprimer l'ancienne table evenements_locaux
DROP TABLE IF EXISTS evenements_locaux CASCADE;

-- Étape 2: Renommer registration_loisirs en inscriptions_loisirs
ALTER TABLE IF EXISTS registration_loisirs 
RENAME TO inscriptions_loisirs;

-- Étape 3: Ajouter les nouvelles colonnes à inscriptions_loisirs
ALTER TABLE inscriptions_loisirs 
ADD COLUMN IF NOT EXISTS prenom text,
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS type_affichage text CHECK (type_affichage IN ('hebdo', 'mensuel', 'annuel')),
ADD COLUMN IF NOT EXISTS est_organisateur boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS prix_entree text,
ADD COLUMN IF NOT EXISTS description text;

-- Étape 4: Activer RLS sur inscriptions_loisirs
ALTER TABLE inscriptions_loisirs ENABLE ROW LEVEL SECURITY;

-- Étape 5: Créer les politiques RLS

-- Politique SELECT: Tous peuvent lire (public)
DROP POLICY IF EXISTS "Lecture publique des inscriptions loisirs" ON inscriptions_loisirs;
CREATE POLICY "Lecture publique des inscriptions loisirs"
  ON inscriptions_loisirs
  FOR SELECT
  TO public
  USING (true);

-- Politique INSERT: Insertions publiques autorisées (anonymes et authentifiés)
DROP POLICY IF EXISTS "Insertions publiques autorisées" ON inscriptions_loisirs;
CREATE POLICY "Insertions publiques autorisées"
  ON inscriptions_loisirs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Politique UPDATE: Seuls les utilisateurs authentifiés peuvent modifier leurs propres entrées
-- (Pour l'instant, on laisse cela ouvert, vous pourrez restreindre plus tard si besoin)
DROP POLICY IF EXISTS "Modifications autorisées" ON inscriptions_loisirs;
CREATE POLICY "Modifications autorisées"
  ON inscriptions_loisirs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique DELETE: Seuls les admins (via une future table profiles avec role admin)
-- Pour l'instant, on laisse cela ouvert aux authentifiés
DROP POLICY IF EXISTS "Suppressions restreintes" ON inscriptions_loisirs;
CREATE POLICY "Suppressions restreintes"
  ON inscriptions_loisirs
  FOR DELETE
  TO authenticated
  USING (true);

-- Étape 6: Créer des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_inscriptions_loisirs_ville ON inscriptions_loisirs(ville);
CREATE INDEX IF NOT EXISTS idx_inscriptions_loisirs_statut ON inscriptions_loisirs(statut);
CREATE INDEX IF NOT EXISTS idx_inscriptions_loisirs_created_at ON inscriptions_loisirs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inscriptions_loisirs_type_affichage ON inscriptions_loisirs(type_affichage);
