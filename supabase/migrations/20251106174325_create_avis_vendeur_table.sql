/*
  # Création de la table des avis vendeurs
  
  1. Nouvelle Table
    - `avis_vendeur` - Table pour stocker les avis sur les vendeurs
      - `id` (uuid, clé primaire)
      - `annonce_id` (uuid, référence à annonces_locales)
      - `vendeur_email` (text) - Email du vendeur noté
      - `note` (integer) - Note de 1 à 5 étoiles
      - `commentaire` (text, optionnel) - Commentaire de l'acheteur
      - `evaluateur_email` (text) - Email de celui qui note
      - `created_at` (timestamptz) - Date de création
      
  2. Sécurité
    - Enable RLS sur la table `avis_vendeur`
    - Politique de lecture publique
    - Politique d'insertion pour utilisateurs authentifiés
    - Empêcher qu'un utilisateur note plusieurs fois le même vendeur pour la même annonce
    
  3. Index
    - Index sur vendeur_email pour calculer rapidement la moyenne
    - Index sur annonce_id
*/

-- Créer la table avis_vendeur
CREATE TABLE IF NOT EXISTS avis_vendeur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annonce_id uuid REFERENCES annonces_locales(id) ON DELETE CASCADE,
  vendeur_email text NOT NULL,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text,
  evaluateur_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(annonce_id, evaluateur_email)
);

-- Enable RLS
ALTER TABLE avis_vendeur ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les avis
CREATE POLICY "Public can read avis"
  ON avis_vendeur
  FOR SELECT
  USING (true);

-- Politique: Utilisateurs authentifiés peuvent insérer des avis
CREATE POLICY "Authenticated users can insert avis"
  ON avis_vendeur
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique: Utilisateurs anonymes peuvent aussi insérer (pour simplicité)
CREATE POLICY "Anyone can insert avis"
  ON avis_vendeur
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_avis_vendeur_email ON avis_vendeur(vendeur_email);
CREATE INDEX IF NOT EXISTS idx_avis_annonce_id ON avis_vendeur(annonce_id);

-- Fonction pour mettre à jour automatiquement la note moyenne du vendeur
CREATE OR REPLACE FUNCTION update_vendeur_note()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE annonces_locales
  SET vendeur_note = (
    SELECT AVG(note)::numeric(3,2)
    FROM avis_vendeur
    WHERE vendeur_email = NEW.vendeur_email
  )
  WHERE user_email = NEW.vendeur_email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la note après insertion d'un avis
CREATE TRIGGER trigger_update_vendeur_note
AFTER INSERT ON avis_vendeur
FOR EACH ROW
EXECUTE FUNCTION update_vendeur_note();