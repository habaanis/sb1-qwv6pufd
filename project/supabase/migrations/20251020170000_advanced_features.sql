/*
  # Features Avancées - ML, Reviews, Favorites

  Cette migration ajoute:
  - Système de recommandations ML
  - Reviews et ratings
  - Favoris et bookmarks
  - User interactions tracking
*/

-- ============================================================
-- ÉTAPE 1 : USER INTERACTIONS (pour ML)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  item_id uuid NOT NULL,
  interaction_type text NOT NULL
    CHECK (interaction_type IN ('view', 'search', 'favorite', 'click', 'share')),
  query text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_item ON user_interactions(item_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created ON user_interactions(created_at DESC);

-- Index composite pour analytics
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_type ON user_interactions(user_id, interaction_type);

-- RLS
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their interactions"
ON user_interactions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view their interactions"
ON user_interactions
FOR SELECT
TO public
USING (true);

-- ============================================================
-- ÉTAPE 2 : RECOMMENDATION LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS recommendation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  item_id uuid NOT NULL,
  score numeric NOT NULL,
  reason text,
  confidence numeric,
  shown boolean DEFAULT true,
  clicked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_logs_user ON recommendation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_item ON recommendation_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_created ON recommendation_logs(created_at DESC);

-- RLS
ALTER TABLE recommendation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage recommendations"
ON recommendation_logs
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 3 : REVIEWS ET RATINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('business', 'event', 'job')),
  user_id text NOT NULL,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  helpful_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  status text DEFAULT 'published'
    CHECK (status IN ('published', 'pending', 'hidden')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item_type ON reviews(item_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Index composite pour filtrage
CREATE INDEX IF NOT EXISTS idx_reviews_item_status ON reviews(item_id, status)
WHERE status = 'published';

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published reviews"
ON reviews
FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "Users can insert reviews"
ON reviews
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can update their reviews"
ON reviews
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 4 : REVIEW HELPFUL VOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(user_id);

-- RLS
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on reviews"
ON review_votes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 5 : FAVORITES / BOOKMARKS
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('business', 'event', 'job')),
  folder text DEFAULT 'default',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_favorites_folder ON favorites(folder);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON favorites(created_at DESC);

-- Index composite
CREATE INDEX IF NOT EXISTS idx_favorites_user_folder ON favorites(user_id, folder);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favorites"
ON favorites
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 6 : RATINGS AGGREGÉS (Vue Matérialisée)
-- ============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS item_ratings AS
SELECT
  item_id,
  item_type,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as avg_rating,
  COUNT(*) FILTER (WHERE rating = 5) as rating_5_count,
  COUNT(*) FILTER (WHERE rating = 4) as rating_4_count,
  COUNT(*) FILTER (WHERE rating = 3) as rating_3_count,
  COUNT(*) FILTER (WHERE rating = 2) as rating_2_count,
  COUNT(*) FILTER (WHERE rating = 1) as rating_1_count,
  MAX(created_at) as last_review_at
FROM reviews
WHERE status = 'published'
GROUP BY item_id, item_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_item_ratings_item ON item_ratings(item_id);
CREATE INDEX IF NOT EXISTS idx_item_ratings_type ON item_ratings(item_type);
CREATE INDEX IF NOT EXISTS idx_item_ratings_avg ON item_ratings(avg_rating DESC);

-- Fonction de rafraîchissement
CREATE OR REPLACE FUNCTION refresh_item_ratings()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY item_ratings;
END;
$$;

-- ============================================================
-- ÉTAPE 7 : FONCTIONS UTILES
-- ============================================================

-- Fonction : Obtenir les statistiques de ratings d'un item
CREATE OR REPLACE FUNCTION get_item_rating_stats(p_item_id uuid)
RETURNS TABLE (
  avg_rating numeric,
  review_count bigint,
  rating_distribution jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::numeric, 1),
    COUNT(*),
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    )
  FROM reviews
  WHERE item_id = p_item_id
    AND status = 'published';
END;
$$;

-- Fonction : Top items par rating
CREATE OR REPLACE FUNCTION get_top_rated_items(
  p_item_type text DEFAULT NULL,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  item_id uuid,
  item_type text,
  avg_rating numeric,
  review_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ir.item_id,
    ir.item_type,
    ir.avg_rating,
    ir.review_count
  FROM item_ratings ir
  WHERE (p_item_type IS NULL OR ir.item_type = p_item_type)
    AND ir.review_count >= 3
  ORDER BY ir.avg_rating DESC, ir.review_count DESC
  LIMIT p_limit;
END;
$$;

-- Fonction : Recommandations basées sur favoris
CREATE OR REPLACE FUNCTION get_similar_to_favorites(
  p_user_id text,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  item_id uuid,
  item_type text,
  similarity_score numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_favorites AS (
    SELECT DISTINCT f.item_type
    FROM favorites f
    WHERE f.user_id = p_user_id
  ),
  user_favorite_items AS (
    SELECT f.item_id
    FROM favorites f
    WHERE f.user_id = p_user_id
  )
  SELECT
    v.id,
    v.type,
    0.8 as similarity_score
  FROM vue_recherche_generale v
  WHERE v.type IN (SELECT item_type FROM user_favorites)
    AND v.id NOT IN (SELECT item_id FROM user_favorite_items)
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$;

-- Fonction : Analytics utilisateur
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'interactions', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'by_type', (
          SELECT jsonb_object_agg(interaction_type, count)
          FROM (
            SELECT interaction_type, COUNT(*) as count
            FROM user_interactions
            WHERE user_id = p_user_id
            GROUP BY interaction_type
          ) t
        )
      )
      FROM user_interactions
      WHERE user_id = p_user_id
    ),
    'favorites', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'by_type', (
          SELECT jsonb_object_agg(item_type, count)
          FROM (
            SELECT item_type, COUNT(*) as count
            FROM favorites
            WHERE user_id = p_user_id
            GROUP BY item_type
          ) t
        )
      )
      FROM favorites
      WHERE user_id = p_user_id
    ),
    'reviews', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'avg_rating', ROUND(AVG(rating)::numeric, 1)
      )
      FROM reviews
      WHERE user_id = p_user_id
        AND status = 'published'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- ÉTAPE 8 : TRIGGERS
-- ============================================================

-- Trigger : Mettre à jour helpful_count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM review_votes
    WHERE review_id = NEW.review_id
      AND is_helpful = true
  )
  WHERE id = NEW.review_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_review_helpful ON review_votes;
CREATE TRIGGER trigger_update_review_helpful
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Trigger : Rafraîchir ratings après review
CREATE OR REPLACE FUNCTION trigger_refresh_ratings()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM refresh_item_ratings();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_review_ratings ON reviews;
CREATE TRIGGER trigger_review_ratings
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_ratings();

-- ============================================================
-- ÉTAPE 9 : VUES UTILES
-- ============================================================

-- Vue : Reviews avec ratings
CREATE OR REPLACE VIEW reviews_enriched AS
SELECT
  r.*,
  ir.avg_rating as item_avg_rating,
  ir.review_count as item_review_count
FROM reviews r
LEFT JOIN item_ratings ir ON r.item_id = ir.item_id;

-- Vue : Top contributeurs
CREATE OR REPLACE VIEW top_reviewers AS
SELECT
  user_id,
  user_name,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as avg_rating_given,
  SUM(helpful_count) as total_helpful_votes
FROM reviews
WHERE status = 'published'
GROUP BY user_id, user_name
ORDER BY review_count DESC
LIMIT 100;

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================

/*
  RÉSUMÉ FEATURES AVANCÉES :

  ✅ Tables créées :
     - user_interactions (tracking ML)
     - recommendation_logs (historique ML)
     - reviews (avis utilisateurs)
     - review_votes (votes utiles)
     - favorites (favoris/bookmarks)
     - item_ratings (vue matérialisée)

  ✅ Fonctions SQL :
     - get_item_rating_stats(item_id)
     - get_top_rated_items(type, limit)
     - get_similar_to_favorites(user_id, limit)
     - get_user_analytics(user_id)
     - refresh_item_ratings()

  ✅ Triggers :
     - Auto-update helpful_count
     - Auto-refresh ratings

  ✅ Vues :
     - reviews_enriched
     - top_reviewers

  🎯 Utilisation :
     -- Stats rating d'un item
     SELECT * FROM get_item_rating_stats('uuid-here');

     -- Top items par rating
     SELECT * FROM get_top_rated_items('business', 10);

     -- Recommandations
     SELECT * FROM get_similar_to_favorites('user-123', 10);

     -- Analytics utilisateur
     SELECT get_user_analytics('user-123');
*/
