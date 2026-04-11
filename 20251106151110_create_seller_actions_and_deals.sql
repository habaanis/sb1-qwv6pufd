/*
  # Seller Actions & Good Deals System

  1. New Table
    - `annonce_bumps` - Track bump history with cooldown
      - `id` (uuid, primary key)
      - `annonce_id` (uuid) - Announcement
      - `user_id` (uuid) - User who bumped
      - `bumped_at` (timestamptz) - When bumped
    
  2. RPC Functions
    - `free_bump_annonce` - Bump announcement (7-day cooldown)
    - `free_set_urgent` - Toggle urgent status (3-day cooldown)
  
  3. Views
    - `v_bonnes_affaires` - Good deals (price reduced, negotiable, recent)
  
  4. Security
    - RLS on annonce_bumps table
    - Only owners can bump/urgent their announcements
*/

-- Create bump tracking table
CREATE TABLE IF NOT EXISTS annonce_bumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annonce_id UUID NOT NULL REFERENCES annonces_locales(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bumped_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE annonce_bumps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bumps
CREATE POLICY "Users can view their bumps"
  ON annonce_bumps
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can create bumps
CREATE POLICY "Users can create bumps"
  ON annonce_bumps
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_annonce_bumps_annonce_id ON annonce_bumps(annonce_id);
CREATE INDEX IF NOT EXISTS idx_annonce_bumps_user_id ON annonce_bumps(user_id);
CREATE INDEX IF NOT EXISTS idx_annonce_bumps_bumped_at ON annonce_bumps(bumped_at DESC);

-- Function to bump announcement (free with cooldown)
CREATE OR REPLACE FUNCTION free_bump_annonce(
  p_annonce_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_owner_email TEXT;
  v_user_email TEXT;
  v_last_bump TIMESTAMPTZ;
  v_cooldown_hours INTEGER := 168; -- 7 days in hours
BEGIN
  -- Get announcement owner
  SELECT user_email INTO v_owner_email
  FROM annonces_locales
  WHERE id = p_annonce_id;

  IF v_owner_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Annonce introuvable'
    );
  END IF;

  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Check ownership
  IF v_owner_email != v_user_email THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Vous n''êtes pas le propriétaire de cette annonce'
    );
  END IF;

  -- Check last bump
  SELECT MAX(bumped_at) INTO v_last_bump
  FROM annonce_bumps
  WHERE annonce_id = p_annonce_id
  AND user_id = p_user_id;

  -- Check cooldown
  IF v_last_bump IS NOT NULL AND 
     (EXTRACT(EPOCH FROM (now() - v_last_bump)) / 3600) < v_cooldown_hours THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Cooldown actif',
      'hours_remaining', ROUND(v_cooldown_hours - (EXTRACT(EPOCH FROM (now() - v_last_bump)) / 3600))
    );
  END IF;

  -- Update announcement created_at to bump it
  UPDATE annonces_locales
  SET created_at = now()
  WHERE id = p_annonce_id;

  -- Record bump
  INSERT INTO annonce_bumps (annonce_id, user_id)
  VALUES (p_annonce_id, p_user_id);

  RETURN json_build_object(
    'success', true,
    'message', 'Annonce remontée avec succès !'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle urgent status (free with cooldown)
CREATE OR REPLACE FUNCTION free_set_urgent(
  p_annonce_id UUID,
  p_user_id UUID,
  p_value BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  v_owner_email TEXT;
  v_user_email TEXT;
  v_current_urgent BOOLEAN;
  v_last_urgent_change TIMESTAMPTZ;
  v_cooldown_hours INTEGER := 72; -- 3 days in hours
BEGIN
  -- Get announcement owner and current urgent status
  SELECT user_email, est_urgent INTO v_owner_email, v_current_urgent
  FROM annonces_locales
  WHERE id = p_annonce_id;

  IF v_owner_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Annonce introuvable'
    );
  END IF;

  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Check ownership
  IF v_owner_email != v_user_email THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Vous n''êtes pas le propriétaire de cette annonce'
    );
  END IF;

  -- If setting to true, check cooldown
  IF p_value = true THEN
    SELECT created_at INTO v_last_urgent_change
    FROM annonces_locales
    WHERE id = p_annonce_id
    AND est_urgent = true;

    -- Check if urgent was recently activated
    IF v_last_urgent_change IS NOT NULL AND
       (EXTRACT(EPOCH FROM (now() - v_last_urgent_change)) / 3600) < v_cooldown_hours THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Cooldown actif pour le badge URGENT',
        'hours_remaining', ROUND(v_cooldown_hours - (EXTRACT(EPOCH FROM (now() - v_last_urgent_change)) / 3600))
      );
    END IF;
  END IF;

  -- Update urgent status
  UPDATE annonces_locales
  SET est_urgent = p_value
  WHERE id = p_annonce_id;

  RETURN json_build_object(
    'success', true,
    'message', CASE 
      WHEN p_value THEN 'Badge URGENT activé !'
      ELSE 'Badge URGENT désactivé'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for good deals
CREATE OR REPLACE VIEW v_bonnes_affaires AS
SELECT 
  a.id,
  a.titre as title,
  a.prix as price,
  a.localisation_ville as city,
  a.categorie as category,
  a.photo_url,
  a.est_urgent as urgent,
  a.created_at as date_publication,
  a.vendeur_badge,
  a.vendeur_note,
  a.nombre_vues_reelles as vues,
  EXTRACT(EPOCH FROM (now() - a.created_at))/3600 as hours_ago
FROM annonces_locales a
WHERE 
  a.statut_moderation = 'approved'
  AND a.date_expiration > now()
  AND (
    a.prix = 0 -- Negotiable
    OR a.est_urgent = true -- Urgent deals
    OR (EXTRACT(EPOCH FROM (now() - a.created_at))/3600) < 48 -- Recent (last 2 days)
  )
ORDER BY 
  a.est_urgent DESC,
  a.created_at DESC
LIMIT 10;

-- Grant access to view
GRANT SELECT ON v_bonnes_affaires TO anon, authenticated;

-- Add comment to explain cooldowns
COMMENT ON FUNCTION free_bump_annonce IS 'Bump announcement to top with 7-day cooldown';
COMMENT ON FUNCTION free_set_urgent IS 'Toggle urgent badge with 3-day cooldown';
