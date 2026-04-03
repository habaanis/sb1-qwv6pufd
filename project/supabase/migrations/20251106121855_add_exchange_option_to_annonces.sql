/*
  # Add Exchange Option to Local Marketplace

  1. Changes
    - Modify type_annonce CHECK constraint to include 'exchange'
    - Update search function to support exchange type
    - Add sample exchange announcements
  
  2. New Values
    - type_annonce can now be: 'sell', 'buy', or 'exchange'
*/

-- Drop the existing constraint
ALTER TABLE annonces_locales 
  DROP CONSTRAINT IF EXISTS annonces_locales_type_annonce_check;

-- Add new constraint with exchange option
ALTER TABLE annonces_locales 
  ADD CONSTRAINT annonces_locales_type_annonce_check 
  CHECK (type_annonce IN ('sell', 'buy', 'exchange'));

-- Update search function to handle exchange type
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

-- Add sample exchange announcements
INSERT INTO annonces_locales (titre, description, prix, localisation_ville, contact_tel, statut_moderation, categorie, type_annonce, user_email)
VALUES
  ('Échange Console PS5 contre Xbox Series X', 'Console PS5 en excellent état avec 3 jeux. Je cherche à échanger contre une Xbox Series X en bon état. Possibilité de négocier un échange équitable.', 0.000, 'Tunis', '+216 26 789 012', 'approved', 'Électronique', 'exchange', 'user6@example.com'),
  ('Échange Cours de Français contre Cours d''Anglais', 'Professeur de français cherche à échanger des cours particuliers contre des cours d''anglais. Niveau avancé. 2h par semaine.', 0.000, 'Sfax', '+216 27 890 123', 'approved', 'Services', 'exchange', 'user7@example.com'),
  ('Échange livres universitaires Droit', 'J''ai des livres de droit 2ème année, je cherche à échanger contre livres de 3ème année droit. Tous en excellent état.', 0.000, 'Sousse', '+216 28 901 234', 'approved', 'Éducation', 'exchange', 'user8@example.com')
ON CONFLICT DO NOTHING;
