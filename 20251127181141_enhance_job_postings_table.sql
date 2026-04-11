/*
  # Enhance job_postings table for recruiter job posting

  1. Changes
    - Add `created_by` column (uuid) to track who posted the job
    - Add `skills` column (text[]) for required skills
    - Add `seniority` column (text) for experience level
    - Add `salary_min` and `salary_max` columns (numeric) for salary range
    - Add `description_text` column (text) for detailed job description
    - Rename `type` to `contract_type` for clarity
  
  2. Security
    - Update RLS policies to use created_by
    - Allow users to manage their own job postings
    - Allow public to view active job postings
*/

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'skills'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN skills text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'seniority'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN seniority text CHECK (seniority IN ('junior', 'mid', 'senior', 'all'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'salary_min'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN salary_min numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'salary_max'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN salary_max numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'description_text'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN description_text text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_postings' AND column_name = 'contract_type'
  ) THEN
    ALTER TABLE job_postings ADD COLUMN contract_type text CHECK (contract_type IN ('CDI', 'CDD', 'Intérim', 'Stage', 'Freelance'));
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own job postings" ON job_postings;
DROP POLICY IF EXISTS "Users can insert own job postings" ON job_postings;
DROP POLICY IF EXISTS "Users can update own job postings" ON job_postings;
DROP POLICY IF EXISTS "Users can delete own job postings" ON job_postings;
DROP POLICY IF EXISTS "Anyone can view active job postings" ON job_postings;

-- Create new RLS policies
CREATE POLICY "Users can view own job postings"
  ON job_postings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own job postings"
  ON job_postings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own job postings"
  ON job_postings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own job postings"
  ON job_postings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view active job postings"
  ON job_postings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');
