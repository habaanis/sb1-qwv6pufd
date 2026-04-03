-- Création de la table Établissements Éducation
-- 
-- 1. Nouvelle Table: etablissements_education
--    Colonnes: id, nom, type, niveau, système, langue, frais, coordonnées, etc.
-- 
-- 2. Sécurité: RLS activé avec politiques pour SELECT public et INSERT/UPDATE authentifié
-- 
-- 3. Indexes: Sur ville, type, niveau, full-text search

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS etablissements_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type_etablissement text DEFAULT 'Public',
  niveau_etude text DEFAULT 'Primaire',
  systeme_enseignement text DEFAULT 'National',
  langue_principale text DEFAULT 'Arabe',
  frais_scolarite_range text DEFAULT 'Moyen',
  adresse text,
  ville text,
  delegation text,
  telephone text,
  email text,
  site_web text,
  description text,
  accreditations text[] DEFAULT '{}',
  homologue_francais boolean DEFAULT false,
  ratio_eleves_enseignant numeric,
  transport_scolaire boolean DEFAULT false,
  latitude numeric,
  longitude numeric,
  note_moyenne numeric DEFAULT 0,
  nombre_avis integer DEFAULT 0,
  niveau_abonnement integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE etablissements_education ENABLE ROW LEVEL SECURITY;

-- Politique SELECT pour tous
CREATE POLICY "Tout le monde peut consulter les établissements"
  ON etablissements_education FOR SELECT
  TO public
  USING (true);

-- Politique INSERT pour authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent ajouter des établissements"
  ON etablissements_education FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique UPDATE pour authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent modifier des établissements"
  ON etablissements_education FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique DELETE pour authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des établissements"
  ON etablissements_education FOR DELETE
  TO authenticated
  USING (true);

-- Créer les indexes
CREATE INDEX IF NOT EXISTS idx_etablissements_ville ON etablissements_education(ville);
CREATE INDEX IF NOT EXISTS idx_etablissements_delegation ON etablissements_education(delegation);
CREATE INDEX IF NOT EXISTS idx_etablissements_type ON etablissements_education(type_etablissement);
CREATE INDEX IF NOT EXISTS idx_etablissements_niveau ON etablissements_education(niveau_etude);
CREATE INDEX IF NOT EXISTS idx_etablissements_abonnement ON etablissements_education(niveau_abonnement DESC);
CREATE INDEX IF NOT EXISTS idx_etablissements_note ON etablissements_education(note_moyenne DESC);

-- Créer un index full-text search
CREATE INDEX IF NOT EXISTS idx_etablissements_search 
  ON etablissements_education 
  USING gin(to_tsvector('french', coalesce(nom, '') || ' ' || coalesce(description, '')));