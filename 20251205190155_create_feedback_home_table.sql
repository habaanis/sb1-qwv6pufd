/*
  # Création de la table feedback_home

  1. Nouvelle Table
    - `feedback_home`
      - `id` (uuid, primary key) - Identifiant unique
      - `created_at` (timestamptz) - Date et heure de création
      - `rating` (text) - Type de feedback: 'positif', 'neutre', ou 'negatif'
      - `comment` (text, nullable) - Commentaire optionnel de l'utilisateur
      - `page` (text) - Page d'origine du feedback (ex: 'home')
      - `user_ip` (text, nullable) - Adresse IP de l'utilisateur (optionnel)
      - `user_agent` (text, nullable) - User agent du navigateur (optionnel)

  2. Sécurité
    - Enable RLS sur `feedback_home`
    - Policy permettant à tous les utilisateurs (anonymes inclus) d'insérer des feedbacks
    - Aucune policy de lecture (les feedbacks sont privés, uniquement pour l'admin)

  3. Indexes
    - Index sur `created_at` pour faciliter les requêtes temporelles
    - Index sur `rating` pour les statistiques
    - Index sur `page` pour filtrer par page

  4. Contraintes
    - Le rating doit être l'une des valeurs: 'positif', 'neutre', 'negatif'
    - La page est obligatoire
*/

-- Création de la table feedback_home
CREATE TABLE IF NOT EXISTS feedback_home (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  rating text NOT NULL CHECK (rating IN ('positif', 'neutre', 'negatif')),
  comment text,
  page text NOT NULL DEFAULT 'home',
  user_ip text,
  user_agent text
);

-- Activation de RLS
ALTER TABLE feedback_home ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde (anonyme inclus) peut insérer des feedbacks
CREATE POLICY "Anyone can insert feedback"
  ON feedback_home
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_feedback_home_created_at ON feedback_home(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_home_rating ON feedback_home(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_home_page ON feedback_home(page);

-- Commentaires pour la documentation
COMMENT ON TABLE feedback_home IS 'Table pour stocker les feedbacks utilisateurs depuis la page d''accueil';
COMMENT ON COLUMN feedback_home.rating IS 'Type de feedback: positif, neutre, ou negatif';
COMMENT ON COLUMN feedback_home.comment IS 'Commentaire optionnel de l''utilisateur';
COMMENT ON COLUMN feedback_home.page IS 'Page d''origine du feedback';
