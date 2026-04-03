/*
  # Création de la table avis_entreprise

  ## Description
  Création de la table pour stocker les avis des clients sur les entreprises.

  ## Nouvelles Tables
  - `avis_entreprise`
    - `id` (uuid, clé primaire, auto-généré)
    - `entreprise_id` (text, référence vers la table entreprise)
    - `note` (integer, note de 1 à 5)
    - `commentaire` (text, commentaire de l'utilisateur)
    - `date` (timestamptz, date de création de l'avis)
    - `created_at` (timestamptz, date de création de l'enregistrement)

  ## Sécurité
  - Active RLS (Row Level Security)
  - Politique de lecture publique (tout le monde peut lire les avis)
  - Politique d'insertion publique (tout le monde peut créer un avis)
*/

-- Création de la table avis_entreprise
CREATE TABLE IF NOT EXISTS avis_entreprise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id text NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text NOT NULL,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_avis_entreprise_entreprise_id ON avis_entreprise(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_avis_entreprise_date ON avis_entreprise(date DESC);

-- Active RLS
ALTER TABLE avis_entreprise ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Tout le monde peut lire les avis"
  ON avis_entreprise
  FOR SELECT
  TO public
  USING (true);

-- Politique d'insertion publique
CREATE POLICY "Tout le monde peut créer un avis"
  ON avis_entreprise
  FOR INSERT
  TO public
  WITH CHECK (true);
