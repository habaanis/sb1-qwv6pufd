/*
  # Create partner requests table

  1. New Tables
    - `partner_requests`
      - `id` (uuid, primary key) - Unique identifier for each request
      - `profile_type` (text) - Type of profile: company, freelancer, provider
      - `company_name` (text) - Name of the company or business
      - `sector` (text) - Business sector/industry
      - `region` (text) - Geographic region
      - `search_type` (text) - Type of search: partner, supplier, client, other
      - `description` (text) - Detailed description of needs or offers
      - `email` (text) - Contact email
      - `phone` (text, nullable) - Contact phone number (optional)
      - `language` (text) - Language of the request
      - `created_at` (timestamptz) - Timestamp when request was created

  2. Security
    - Enable RLS on `partner_requests` table
    - Add policy for anyone to insert (public form submission)
    - Add policy for authenticated admins to read all requests
*/

CREATE TABLE IF NOT EXISTS partner_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_type text NOT NULL,
  company_name text NOT NULL,
  sector text NOT NULL,
  region text NOT NULL,
  search_type text NOT NULL,
  description text NOT NULL,
  email text NOT NULL,
  phone text,
  language text NOT NULL DEFAULT 'fr',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE partner_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partner requests"
  ON partner_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all partner requests"
  ON partner_requests
  FOR SELECT
  TO authenticated
  USING (true);