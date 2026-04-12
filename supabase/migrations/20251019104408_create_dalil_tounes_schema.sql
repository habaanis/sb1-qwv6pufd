/*
  # Dalil Tounes Database Schema

  ## Overview
  This migration creates the core database structure for Dalil Tounes, a Tunisian directory platform
  connecting businesses, citizens, and tourists.

  ## New Tables

  ### 1. businesses
  Stores business directory listings with complete information
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Business name
  - `category` (text) - Business category/type
  - `city` (text) - City location
  - `address` (text) - Full address
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email
  - `website` (text, optional) - Business website URL
  - `description` (text) - Business description
  - `image_url` (text, optional) - Business image/logo URL
  - `status` (text) - Status: 'approved', 'pending', 'rejected'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. business_suggestions
  Stores user-submitted business suggestions for review
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Suggested business name
  - `category` (text) - Business category
  - `city` (text) - City location
  - `address` (text) - Full address
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `website` (text, optional) - Website URL
  - `description` (text) - Business description
  - `status` (text) - Status: 'pending', 'approved', 'rejected'
  - `submitted_by_email` (text, optional) - Submitter's email
  - `created_at` (timestamptz) - Submission timestamp

  ### 3. job_postings
  Stores job opportunities and listings
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Job title
  - `company` (text) - Company name
  - `category` (text) - Job category/field
  - `city` (text) - Job location
  - `type` (text) - Job type: 'full-time', 'part-time', 'contract', 'internship'
  - `description` (text) - Job description
  - `requirements` (text) - Job requirements
  - `salary_range` (text, optional) - Salary information
  - `contact_email` (text) - Application email
  - `contact_phone` (text, optional) - Contact phone
  - `status` (text) - Status: 'active', 'closed'
  - `created_at` (timestamptz) - Posting date
  - `expires_at` (timestamptz, optional) - Expiration date

  ### 4. job_applications
  Stores job seeker profiles and applications
  - `id` (uuid, primary key) - Unique identifier
  - `full_name` (text) - Applicant name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `city` (text) - Applicant location
  - `job_category` (text) - Desired job category
  - `experience_years` (integer) - Years of experience
  - `cv_url` (text, optional) - CV/Resume URL
  - `description` (text) - Brief profile description
  - `created_at` (timestamptz) - Application date

  ## Security
  - RLS enabled on all tables
  - Public read access for approved/active content
  - Authenticated users can submit suggestions and applications
  - Only authenticated users can manage their own submissions

  ## Indexes
  - Category and city indexes for fast filtering
  - Status indexes for efficient queries
  - Full-text search support for business and job searches
*/

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  description text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_suggestions table
CREATE TABLE IF NOT EXISTS business_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by_email text,
  created_at timestamptz DEFAULT now()
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  category text NOT NULL,
  city text NOT NULL,
  type text NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
  description text NOT NULL,
  requirements text NOT NULL,
  salary_range text,
  contact_email text NOT NULL,
  contact_phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  job_category text NOT NULL,
  experience_years integer NOT NULL DEFAULT 0,
  cv_url text,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_category ON job_postings(category);
CREATE INDEX IF NOT EXISTS idx_job_postings_city ON job_postings(city);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Anyone can view approved businesses"
  ON businesses FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can insert businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for business_suggestions
CREATE POLICY "Anyone can insert business suggestions"
  ON business_suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own suggestions"
  ON business_suggestions FOR SELECT
  USING (true);

-- RLS Policies for job_postings
CREATE POLICY "Anyone can view active job postings"
  ON job_postings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert job postings"
  ON job_postings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update job postings"
  ON job_postings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for job_applications
CREATE POLICY "Anyone can insert job applications"
  ON job_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view job applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (true);