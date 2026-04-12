/*
  # Create business reviews table

  1. New Tables
    - `avis_entreprise` (business_reviews)
      - `id` (uuid, primary key)
      - `entreprise_id` (uuid, foreign key to businesses)
      - `nom_utilisateur` (text, reviewer name)
      - `commentaire` (text, review comment)
      - `note` (integer, rating 1-5)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `avis_entreprise` table
    - Add policy for public read access
    - Add policy for authenticated users to insert reviews

  3. Indexes
    - Index on entreprise_id for fast review lookups
    - Index on created_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS avis_entreprise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nom_utilisateur text NOT NULL,
  commentaire text NOT NULL,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE avis_entreprise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON avis_entreprise
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON avis_entreprise
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_avis_entreprise_id ON avis_entreprise(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_avis_created_at ON avis_entreprise(created_at DESC);