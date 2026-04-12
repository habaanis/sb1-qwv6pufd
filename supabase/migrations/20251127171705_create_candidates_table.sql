/*
  # Create candidates table for CV deposits

  1. New Tables
    - `candidates`
      - `id` (uuid, primary key)
      - `created_by` (uuid, references auth.users) - User who created the profile
      - `full_name` (text) - Candidate full name
      - `city` (text) - City
      - `category` (text) - Macro category (sante, it, education, administration, magasin, autres)
      - `skills` (text[]) - Skills array (normalized: lowercase, no accents)
      - `experience_years` (integer) - Years of experience
      - `languages` (text[]) - Languages spoken
      - `desired_contracts` (text[]) - Contract types (CDI, CDD, Intérim, Stage, Freelance)
      - `visibility` (text) - Profile visibility (private or public)
      - `cv_url` (text) - URL to uploaded CV
      - `availability` (text) - Availability information
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `candidates` table
    - Add policy for users to manage their own profile
    - Add policy for public to view public profiles
*/

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  full_name text NOT NULL,
  city text NOT NULL,
  category text NOT NULL CHECK (category IN ('sante', 'it', 'education', 'administration', 'magasin', 'autres')),
  skills text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  languages text[] DEFAULT '{}',
  desired_contracts text[] DEFAULT '{}',
  visibility text DEFAULT 'public' CHECK (visibility IN ('private', 'public')),
  cv_url text,
  availability text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(created_by)
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own candidate profile"
  ON candidates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own candidate profile"
  ON candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own candidate profile"
  ON candidates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own candidate profile"
  ON candidates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policy: Anyone can view public profiles
CREATE POLICY "Anyone can view public candidate profiles"
  ON candidates
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'public');

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv', 'cv', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for CV bucket
CREATE POLICY "Users can upload their own CV"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cv' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own CV"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cv' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own CV"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'cv' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view CVs"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'cv');
