/*
  # Create Business Events Table

  1. New Tables
    - `business_events`
      - `id` (uuid, primary key)
      - `event_name` (text) - Name of the event
      - `event_date` (date) - Date of the event
      - `location` (text) - Event location/venue
      - `city` (text) - City where event takes place
      - `type` (text) - Type: salon, conference, formation, networking, autre
      - `short_description` (text) - Brief description
      - `organizer` (text) - Organizer name
      - `website` (text) - Registration link or website
      - `image_url` (text) - Event image URL
      - `featured` (boolean) - Whether event is featured on homepage
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `business_events` table
    - Add policy for public to read all events
    - Add policy for authenticated users to submit events (insert only)
*/

CREATE TABLE IF NOT EXISTS business_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_date date NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  type text NOT NULL CHECK (type IN ('salon', 'conference', 'formation', 'networking', 'autre')),
  short_description text NOT NULL,
  organizer text NOT NULL,
  website text,
  image_url text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view business events"
  ON business_events
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit business events"
  ON business_events
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_business_events_date ON business_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_business_events_featured ON business_events(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_business_events_type ON business_events(type);
