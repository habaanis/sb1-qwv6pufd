/*
  # Create Reviews/Avis System

  1. New Table
    - `avis` - Reviews for sellers
      - `id` (uuid, primary key)
      - `seller_id` (text) - Seller email/identifier
      - `rater_id` (uuid) - User who left the review
      - `annonce_id` (uuid) - Related announcement
      - `rating` (integer) - Rating 1-5
      - `comment` (text) - Review text
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on avis table
    - Anyone can read reviews
    - Only authenticated users can create reviews
    - Users cannot review their own announcements
    - One review per user per announcement

  3. Indexes
    - Index on seller_id for fast lookups
    - Index on annonce_id
*/

-- Create avis table
CREATE TABLE IF NOT EXISTS avis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id TEXT NOT NULL,
  rater_id UUID,
  annonce_id UUID REFERENCES annonces_locales(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON avis
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON avis
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = rater_id
    AND NOT EXISTS (
      SELECT 1 FROM avis
      WHERE avis.annonce_id = avis.annonce_id
      AND avis.rater_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_avis_seller_id ON avis(seller_id);
CREATE INDEX IF NOT EXISTS idx_avis_annonce_id ON avis(annonce_id);
CREATE INDEX IF NOT EXISTS idx_avis_rater_id ON avis(rater_id);
CREATE INDEX IF NOT EXISTS idx_avis_created_at ON avis(created_at DESC);

-- Function to get seller rating average
CREATE OR REPLACE FUNCTION get_seller_rating(seller_email TEXT)
RETURNS TABLE (
  average_rating NUMERIC,
  total_reviews INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating), 1), 0) as average_rating,
    COUNT(*)::INTEGER as total_reviews
  FROM avis
  WHERE seller_id = seller_email;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user can review
CREATE OR REPLACE FUNCTION can_user_review(p_annonce_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_seller_id TEXT;
  v_already_reviewed BOOLEAN;
BEGIN
  -- Get seller_id from announcement
  SELECT user_email INTO v_seller_id
  FROM annonces_locales
  WHERE id = p_annonce_id;

  -- Check if user is trying to review their own announcement
  IF v_seller_id = (SELECT email FROM auth.users WHERE id = p_user_id) THEN
    RETURN false;
  END IF;

  -- Check if user already reviewed this announcement
  SELECT EXISTS(
    SELECT 1 FROM avis
    WHERE annonce_id = p_annonce_id
    AND rater_id = p_user_id
  ) INTO v_already_reviewed;

  RETURN NOT v_already_reviewed;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add some sample reviews
INSERT INTO avis (seller_id, annonce_id, rating, comment, created_at)
SELECT 
  a.user_email,
  a.id,
  (3 + random() * 2)::INTEGER,
  CASE 
    WHEN random() > 0.7 THEN 'Très bon vendeur, article conforme à la description !'
    WHEN random() > 0.4 THEN 'Transaction rapide et efficace, je recommande.'
    ELSE 'Bonne expérience, merci !'
  END,
  now() - (random() * INTERVAL '30 days')
FROM annonces_locales a
WHERE a.statut_moderation = 'approved'
LIMIT 5
ON CONFLICT DO NOTHING;
