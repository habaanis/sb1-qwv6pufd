/*
  # Create quotes table for custom subscription requests

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `nom` (text) - Full name of requester
      - `email` (text) - Email address
      - `telephone` (text) - Phone number
      - `entreprise` (text, optional) - Company name
      - `message` (text) - Custom message/requirements
      - `budget_estime` (text, optional) - Estimated budget
      - `created_at` (timestamp) - Creation timestamp
      - `statut` (text) - Status: 'nouveau', 'en_cours', 'traite', 'archive'
      
  2. Security
    - Enable RLS on `quotes` table
    - Allow anonymous users to insert quotes
    - Only authenticated admins can read/update quotes
*/

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  entreprise text,
  message text NOT NULL,
  budget_estime text,
  statut text DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'en_cours', 'traite', 'archive')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a quote request
CREATE POLICY "Anyone can submit quote request"
  ON quotes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view quotes (for admin purposes)
CREATE POLICY "Authenticated users can view quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update quotes
CREATE POLICY "Authenticated users can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_statut ON quotes(statut);