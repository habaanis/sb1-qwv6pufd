/*
  # Création table professeurs privés

  ## Description
  Création de la table pour gérer les inscriptions des professeurs privés sur la plateforme Dalil Tounes.
  Les citoyens pourront trouver des professeurs par matière et ville.

  ## Tables créées
  - `professeurs_prives`
    - `id` (uuid, clé primaire)
    - `nom` (text, requis) - Nom complet du professeur
    - `matiere` (text, requis) - Matière enseignée
    - `ville` (text, requis) - Ville du professeur
    - `telephone` (text, optionnel) - Téléphone de contact
    - `email` (text, optionnel) - Email de contact
    - `description` (text, optionnel) - Brève présentation
    - `experience` (text, optionnel) - Années d'expérience
    - `statut` (text, default 'actif') - Statut du professeur
    - `created_at` (timestamptz) - Date de création

  ## Sécurité
  - RLS activé sur la table
  - Politique SELECT publique (lecture par tous)
  - Politique INSERT publique (inscription ouverte)
  - Les professeurs ne peuvent modifier que leurs propres données (future feature avec auth)

  ## Index
  - Index sur matiere pour recherche rapide
  - Index sur ville pour filtrage géographique
  - Index sur statut pour filtrer les professeurs actifs
*/

-- Création de la table professeurs_prives
CREATE TABLE IF NOT EXISTS professeurs_prives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  matiere text NOT NULL,
  ville text NOT NULL,
  telephone text,
  email text,
  description text,
  experience text,
  statut text DEFAULT 'actif',
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE professeurs_prives ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : Tout le monde peut voir les professeurs actifs
CREATE POLICY "Lecture publique professeurs actifs"
  ON professeurs_prives
  FOR SELECT
  USING (statut = 'actif');

-- Politique INSERT : Tout le monde peut s'inscrire comme professeur
CREATE POLICY "Inscription publique professeurs"
  ON professeurs_prives
  FOR INSERT
  WITH CHECK (true);

-- Création des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_professeurs_matiere ON professeurs_prives(matiere);
CREATE INDEX IF NOT EXISTS idx_professeurs_ville ON professeurs_prives(ville);
CREATE INDEX IF NOT EXISTS idx_professeurs_statut ON professeurs_prives(statut);
CREATE INDEX IF NOT EXISTS idx_professeurs_created_at ON professeurs_prives(created_at DESC);

-- Ajout de commentaires sur la table et les colonnes
COMMENT ON TABLE professeurs_prives IS 'Table des professeurs privés inscrits sur Dalil Tounes';
COMMENT ON COLUMN professeurs_prives.nom IS 'Nom complet du professeur';
COMMENT ON COLUMN professeurs_prives.matiere IS 'Matière ou spécialité enseignée';
COMMENT ON COLUMN professeurs_prives.ville IS 'Ville où le professeur exerce';
COMMENT ON COLUMN professeurs_prives.statut IS 'Statut du professeur: actif, inactif, suspendu';
