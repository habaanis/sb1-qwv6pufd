/*
  # Autoriser les utilisateurs anonymes à déposer des annonces
  
  1. Modifications
    - Ajoute une politique pour permettre aux utilisateurs anonymes (anon) de créer des annonces
    - Les annonces créées par des anonymes auront le statut 'pending' par défaut
    
  2. Sécurité
    - Les annonces restent en modération (statut 'pending') par défaut
    - Seules les annonces approuvées sont visibles publiquement
*/

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Anonymous users can create announcements" ON annonces_locales;

-- Permettre aux utilisateurs anonymes de créer des annonces
CREATE POLICY "Anonymous users can create announcements"
  ON annonces_locales
  FOR INSERT
  TO anon
  WITH CHECK (true);