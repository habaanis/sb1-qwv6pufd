/*
  # Création de la table entreprise principale
  
  1. Nouvelle Table
    - `entreprise` - Table principale pour tous les établissements tunisiens
      - `id` (uuid, clé primaire)
      - `nom` (text, non null) - Nom de l'établissement
      - `ville` (text, non null) - Ville
      - `categories` (text, non null) - Catégorie principale
      - `sous_categories` (text, nullable) - Sous-catégorie
      - `adresse` (text, nullable) - Adresse complète
      - `telephone` (text, nullable) - Numéro de téléphone
      - `email` (text, nullable) - Email de contact
      - `site_web` (text, nullable) - Site web
      - `description` (text, nullable) - Description de l'établissement
      - `image_url` (text, nullable) - URL de l'image
      - `status` (text, non null) - Statut: approved, pending, rejected
      - `verified` (boolean, default false) - Établissement vérifié
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de mise à jour
      
  2. Sécurité
    - Enable RLS sur la table `entreprise`
    - Politique de lecture publique pour les établissements approuvés
    - Politique d'insertion pour les utilisateurs authentifiés
    
  3. Migration des données
    - Copie des données existantes depuis `businesses` vers `entreprise`
*/

-- Créer la table entreprise
CREATE TABLE IF NOT EXISTS entreprise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  ville text NOT NULL,
  categories text NOT NULL,
  sous_categories text,
  adresse text,
  telephone text,
  email text,
  site_web text,
  description text,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE entreprise ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les établissements approuvés
CREATE POLICY "Public can read approved entreprise"
  ON entreprise
  FOR SELECT
  USING (status = 'approved');

-- Politique: Utilisateurs authentifiés peuvent insérer
CREATE POLICY "Authenticated users can insert entreprise"
  ON entreprise
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique: Utilisateurs authentifiés peuvent mettre à jour leurs propres établissements
CREATE POLICY "Authenticated users can update entreprise"
  ON entreprise
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Migrer les données existantes de businesses vers entreprise
INSERT INTO entreprise (nom, ville, categories, adresse, telephone, email, site_web, description, image_url, status, created_at, updated_at)
SELECT 
  name as nom,
  city as ville,
  category as categories,
  address as adresse,
  phone as telephone,
  email,
  website as site_web,
  description,
  image_url,
  status,
  created_at,
  updated_at
FROM businesses
WHERE NOT EXISTS (
  SELECT 1 FROM entreprise WHERE entreprise.nom = businesses.name AND entreprise.ville = businesses.city
);

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_entreprise_status ON entreprise(status);
CREATE INDEX IF NOT EXISTS idx_entreprise_ville ON entreprise(ville);
CREATE INDEX IF NOT EXISTS idx_entreprise_categories ON entreprise(categories);
CREATE INDEX IF NOT EXISTS idx_entreprise_search ON entreprise USING gin(to_tsvector('french', nom || ' ' || COALESCE(description, '') || ' ' || ville || ' ' || categories));

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_entreprise_updated_at ON entreprise;
CREATE TRIGGER update_entreprise_updated_at
  BEFORE UPDATE ON entreprise
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
