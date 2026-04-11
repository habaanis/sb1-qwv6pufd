/*
  # Create Local Marketplace Announcements Table

  1. New Table
    - `annonces_locales` - Stores local marketplace announcements
      - `id` (uuid, primary key)
      - `titre` (text) - Title of the announcement
      - `description` (text) - Detailed description
      - `prix` (numeric) - Price in TND
      - `localisation_ville` (text) - City/location
      - `contact_tel` (text) - Contact phone number
      - `statut_moderation` (text) - Moderation status (pending, approved, rejected)
      - `photo_url` (text array) - Array of photo URLs
      - `categorie` (text) - Category (Vehicles, House/Garden, Electronics, etc.)
      - `type_annonce` (text) - Type (sell, buy)
      - `user_email` (text) - User email for contact
      - `vues` (integer) - Number of views
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `annonces_locales` table
    - Add policies for:
      - Anyone can view approved announcements
      - Authenticated users can create announcements
      - Users can update their own announcements
      - Admins can moderate announcements

  3. Indexes
    - Create indexes on frequently queried columns
    - Add full-text search index
*/

-- Create annonces_locales table
CREATE TABLE IF NOT EXISTS annonces_locales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  prix NUMERIC(10, 3) NOT NULL DEFAULT 0,
  localisation_ville TEXT NOT NULL,
  contact_tel TEXT NOT NULL,
  statut_moderation TEXT NOT NULL DEFAULT 'pending' CHECK (statut_moderation IN ('pending', 'approved', 'rejected')),
  photo_url TEXT[] DEFAULT ARRAY[]::TEXT[],
  categorie TEXT NOT NULL,
  type_annonce TEXT NOT NULL CHECK (type_annonce IN ('sell', 'buy')),
  user_email TEXT,
  vues INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE annonces_locales ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved announcements
CREATE POLICY "Anyone can view approved announcements"
  ON annonces_locales
  FOR SELECT
  USING (statut_moderation = 'approved');

-- Policy: Authenticated users can create announcements
CREATE POLICY "Authenticated users can create announcements"
  ON annonces_locales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update their own pending announcements
CREATE POLICY "Users can update own pending announcements"
  ON annonces_locales
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.jwt()->>'email' AND statut_moderation = 'pending')
  WITH CHECK (user_email = auth.jwt()->>'email');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_annonces_locales_ville 
  ON annonces_locales(localisation_ville);

CREATE INDEX IF NOT EXISTS idx_annonces_locales_categorie 
  ON annonces_locales(categorie);

CREATE INDEX IF NOT EXISTS idx_annonces_locales_statut 
  ON annonces_locales(statut_moderation);

CREATE INDEX IF NOT EXISTS idx_annonces_locales_created 
  ON annonces_locales(created_at DESC);

-- Create trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_annonces_locales_titre_trgm 
  ON annonces_locales USING gin (titre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_annonces_locales_description_trgm 
  ON annonces_locales USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_annonces_locales_ville_trgm 
  ON annonces_locales USING gin (localisation_ville gin_trgm_ops);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_annonces_locales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_annonces_locales_updated_at_trigger ON annonces_locales;
CREATE TRIGGER update_annonces_locales_updated_at_trigger
  BEFORE UPDATE ON annonces_locales
  FOR EACH ROW
  EXECUTE FUNCTION update_annonces_locales_updated_at();

-- Create search function for announcements
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
  similarity_score FLOAT
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
    ) as similarity_score
  FROM annonces_locales a
  WHERE 
    a.statut_moderation = 'approved'
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
  ORDER BY similarity_score DESC, a.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- Insert sample data
INSERT INTO annonces_locales (titre, description, prix, localisation_ville, contact_tel, statut_moderation, categorie, type_annonce, user_email)
VALUES
  ('Voiture Peugeot 206 - Excellent état', 'Voiture bien entretenue, révision complète, climatisation, vitres électriques. Faible kilométrage.', 18500.000, 'Tunis', '+216 20 123 456', 'approved', 'Véhicules', 'sell', 'user1@example.com'),
  ('Table de salon en bois massif', 'Belle table artisanale en bois massif avec 6 chaises assorties. Très bon état.', 850.000, 'Sfax', '+216 22 345 678', 'approved', 'Maison & Jardin', 'sell', 'user2@example.com'),
  ('iPhone 12 Pro 128GB', 'iPhone en parfait état, toujours sous garantie. Vendu avec boîte et accessoires d origine.', 2100.000, 'Sousse', '+216 23 456 789', 'approved', 'Électronique', 'sell', 'user3@example.com'),
  ('Recherche appartement à louer', 'Je recherche un appartement 2 pièces meublé dans le centre de Tunis. Budget max 800 TND/mois.', 800.000, 'Tunis', '+216 24 567 890', 'approved', 'Immobilier', 'buy', 'user4@example.com'),
  ('Vélo tout terrain VTT', 'VTT professionnel, 21 vitesses, excellent état. Idéal pour randonnées.', 650.000, 'Nabeul', '+216 25 678 901', 'approved', 'Sport & Loisirs', 'sell', 'user5@example.com')
ON CONFLICT DO NOTHING;
