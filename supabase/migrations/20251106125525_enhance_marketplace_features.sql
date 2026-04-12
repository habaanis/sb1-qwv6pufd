/*
  # Enhance Marketplace with Engagement Features

  1. New Columns for annonces_locales
    - `est_urgent` (boolean) - Mark announcement as urgent
    - `favoris_par` (text array) - Track users who favorited this
    - `date_expiration` (timestamptz) - Auto-expire announcements
    - `nombre_vues_reelles` (integer) - Actual view count
    - `vendeur_note` (numeric) - Seller rating
    - `vendeur_badge` (text) - Seller badge level

  2. New Tables
    - `annonces_signales` - Report system
    - `offres_negociation` - Price negotiation offers
    - `alertes_recherche` - Search alerts for users

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Add new columns to annonces_locales
ALTER TABLE annonces_locales 
  ADD COLUMN IF NOT EXISTS est_urgent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS favoris_par TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS date_expiration TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  ADD COLUMN IF NOT EXISTS nombre_vues_reelles INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendeur_note NUMERIC(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendeur_badge TEXT DEFAULT 'nouveau' CHECK (vendeur_badge IN ('nouveau', 'verifie', 'top_vendeur'));

-- Create index for expiration queries
CREATE INDEX IF NOT EXISTS idx_annonces_locales_expiration 
  ON annonces_locales(date_expiration) WHERE statut_moderation = 'approved';

-- Create index for urgent announcements
CREATE INDEX IF NOT EXISTS idx_annonces_locales_urgent 
  ON annonces_locales(est_urgent, created_at DESC) WHERE statut_moderation = 'approved';

-- Create table for reported announcements
CREATE TABLE IF NOT EXISTS annonces_signales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annonce_id UUID NOT NULL REFERENCES annonces_locales(id) ON DELETE CASCADE,
  motif TEXT NOT NULL,
  description TEXT,
  signale_par TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on annonces_signales
ALTER TABLE annonces_signales ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can report an announcement
CREATE POLICY "Anyone can report announcements"
  ON annonces_signales
  FOR INSERT
  WITH CHECK (true);

-- Create table for price negotiation offers
CREATE TABLE IF NOT EXISTS offres_negociation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annonce_id UUID NOT NULL REFERENCES annonces_locales(id) ON DELETE CASCADE,
  prix_propose NUMERIC(10, 3) NOT NULL,
  message TEXT,
  offrant_nom TEXT,
  offrant_tel TEXT NOT NULL,
  offrant_email TEXT,
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'acceptee', 'refusee')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on offres_negociation
ALTER TABLE offres_negociation ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can make an offer
CREATE POLICY "Anyone can make offers"
  ON offres_negociation
  FOR INSERT
  WITH CHECK (true);

-- Policy: Sellers can view offers on their announcements
CREATE POLICY "Sellers can view their offers"
  ON offres_negociation
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM annonces_locales 
    WHERE annonces_locales.id = offres_negociation.annonce_id 
    AND annonces_locales.user_email = auth.jwt()->>'email'
  ));

-- Create table for search alerts
CREATE TABLE IF NOT EXISTS alertes_recherche (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  mot_cle TEXT NOT NULL,
  ville TEXT,
  categorie TEXT,
  type_annonce TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on alertes_recherche
ALTER TABLE alertes_recherche ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can manage their alerts
CREATE POLICY "Users can manage their search alerts"
  ON alertes_recherche
  FOR ALL
  TO authenticated
  USING (user_email = auth.jwt()->>'email')
  WITH CHECK (user_email = auth.jwt()->>'email');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_annonces_signales_annonce 
  ON annonces_signales(annonce_id);

CREATE INDEX IF NOT EXISTS idx_offres_negociation_annonce 
  ON offres_negociation(annonce_id);

CREATE INDEX IF NOT EXISTS idx_alertes_recherche_email 
  ON alertes_recherche(user_email) WHERE actif = true;

-- Update search function to include new features
DROP FUNCTION IF EXISTS search_annonces_locales(TEXT, TEXT, TEXT, TEXT, FLOAT);

CREATE OR REPLACE FUNCTION search_annonces_locales(
  search_query TEXT,
  city_filter TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  type_filter TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.2
)
RETURNS TABLE (
  id UUID,
  titre TEXT,
  description TEXT,
  prix NUMERIC,
  localisation_ville TEXT,
  contact_tel TEXT,
  photo_url TEXT[],
  categorie TEXT,
  type_annonce TEXT,
  vues INTEGER,
  created_at TIMESTAMPTZ,
  similarity_score FLOAT,
  est_urgent BOOLEAN,
  vendeur_badge TEXT,
  vendeur_note NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.titre,
    a.description,
    a.prix,
    a.localisation_ville,
    a.contact_tel,
    a.photo_url,
    a.categorie,
    a.type_annonce,
    a.vues,
    a.created_at,
    GREATEST(
      similarity(a.titre, search_query),
      similarity(COALESCE(a.description, ''), search_query) * 0.7,
      similarity(COALESCE(a.categorie, ''), search_query) * 0.5
    ) as similarity_score,
    a.est_urgent,
    a.vendeur_badge,
    a.vendeur_note
  FROM annonces_locales a
  WHERE 
    a.statut_moderation = 'approved'
    AND a.date_expiration > now()
    AND (
      search_query IS NULL 
      OR search_query = ''
      OR a.titre % search_query
      OR a.description % search_query
      OR a.categorie % search_query
      OR similarity(a.titre, search_query) > similarity_threshold
      OR similarity(COALESCE(a.description, ''), search_query) > similarity_threshold
    )
    AND (city_filter IS NULL OR a.localisation_ville ILIKE '%' || city_filter || '%')
    AND (category_filter IS NULL OR a.categorie = category_filter)
    AND (type_filter IS NULL OR a.type_annonce = type_filter)
  ORDER BY 
    a.est_urgent DESC,
    similarity_score DESC, 
    a.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_annonce_views(annonce_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE annonces_locales
  SET nombre_vues_reelles = nombre_vues_reelles + 1
  WHERE id = annonce_id;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle favorite
CREATE OR REPLACE FUNCTION toggle_favorite(annonce_id UUID, user_identifier TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_favorited BOOLEAN;
BEGIN
  SELECT user_identifier = ANY(favoris_par) INTO is_favorited
  FROM annonces_locales
  WHERE id = annonce_id;
  
  IF is_favorited THEN
    UPDATE annonces_locales
    SET favoris_par = array_remove(favoris_par, user_identifier)
    WHERE id = annonce_id;
    RETURN false;
  ELSE
    UPDATE annonces_locales
    SET favoris_par = array_append(favoris_par, user_identifier)
    WHERE id = annonce_id;
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update existing announcements with expiration dates
UPDATE annonces_locales
SET date_expiration = created_at + INTERVAL '30 days'
WHERE date_expiration IS NULL;

-- Add some sample data
UPDATE annonces_locales
SET est_urgent = true, vendeur_badge = 'verifie', vendeur_note = 4.5
WHERE id IN (SELECT id FROM annonces_locales ORDER BY created_at DESC LIMIT 2);
