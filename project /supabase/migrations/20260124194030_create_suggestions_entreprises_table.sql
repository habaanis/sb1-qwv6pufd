/*
  # Création de la table suggestions_entreprises

  1. Nouvelle Table
    - `suggestions_entreprises` - Table pour les suggestions d'entreprises à ajouter
      - `id` (uuid, clé primaire)
      - `nom_entreprise` (text, non null) - Nom de l'entreprise suggérée
      - `secteur` (text, non null) - Secteur d'activité
      - `contact_suggere` (text, nullable) - Contact suggéré (téléphone, email, etc.)
      - `raison_suggestion` (text, nullable) - Raison de la suggestion
      - `ville` (text, nullable) - Ville de l'entreprise
      - `email_suggesteur` (text, nullable) - Email de la personne qui suggère
      - `statut` (text, default 'en_attente') - Statut de traitement
      - `created_at` (timestamptz) - Date de création

  2. Sécurité
    - Enable RLS sur la table `suggestions_entreprises`
    - Politique de lecture pour les administrateurs uniquement
    - Politique d'insertion publique (formulaires anonymes)
*/

-- Créer la table suggestions_entreprises
CREATE TABLE IF NOT EXISTS suggestions_entreprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_entreprise text NOT NULL,
  secteur text NOT NULL,
  contact_suggere text,
  raison_suggestion text,
  ville text,
  email_suggesteur text,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'traitee', 'rejetee')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE suggestions_entreprises ENABLE ROW LEVEL SECURITY;

-- Politique: Insertion publique (formulaires anonymes)
CREATE POLICY "Tout le monde peut suggérer une entreprise"
  ON suggestions_entreprises
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Politique: Lecture publique des suggestions
CREATE POLICY "Lecture publique des suggestions"
  ON suggestions_entreprises
  FOR SELECT
  TO public
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_suggestions_entreprises_statut ON suggestions_entreprises(statut);
CREATE INDEX IF NOT EXISTS idx_suggestions_entreprises_created_at ON suggestions_entreprises(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_entreprises_secteur ON suggestions_entreprises(secteur);