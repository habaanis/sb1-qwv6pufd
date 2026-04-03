/*
  # Création de la table evenements_locaux

  ## 1. Contexte
    Création de la table pour gérer les événements de loisirs locaux
    affichés dans la page CitizensLeisure. Cette table permet de stocker
    les événements avec leur secteur, dates, prix, et informations de contact.

  ## 2. Table Créée
    Table: `evenements_locaux`
    
    Colonnes principales:
    - `id` (uuid, primary key)
    - `titre` (text, required) - Titre de l'événement
    - `description` (text) - Description détaillée
    - `description_courte` (text) - Description courte pour les cartes
    - `secteur_evenement` (text) - Secteur (Art & Culture, Sorties, Sport & Aventure, etc.)
    - `type_evenement` (text) - Type spécifique (Concert, Festival, etc.)
    - `date_debut` (timestamptz, required) - Date de début
    - `date_fin` (timestamptz) - Date de fin
    - `localisation_ville` (text) - Ville
    - `lieu` (text) - Lieu précis
    - `prix` (text) - Prix de l'entrée
    - `lien_billetterie` (text) - Lien pour réserver
    - `image_url` (text) - URL de l'image de l'événement
    - `telephone_contact` (text) - Téléphone de contact
    - `organisateur` (text) - Nom de l'organisateur
    - `est_annuel` (boolean) - Si l'événement est annuel
    - `niveau_abonnement` (text) - Niveau (gratuit, basic, premium, elite)
    - `est_valide` (boolean) - Si l'événement est validé/approuvé
    - `created_at`, `updated_at` (timestamptz)

  ## 3. Index
    - Index sur secteur_evenement pour filtrage rapide
    - Index sur date_debut pour tri chronologique
    - Index sur localisation_ville pour recherche géographique
    - Index composé (secteur + ville) pour filtres combinés
    - Index sur est_valide pour filtrer les événements approuvés

  ## 4. Sécurité
    - RLS activé
    - Lecture publique pour tous les événements validés
    - Insertion/modification pour utilisateurs authentifiés
    - Les événements sont "Approved" (est_valide = true) par défaut
*/

-- Créer la table evenements_locaux
CREATE TABLE IF NOT EXISTS evenements_locaux (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  description_courte text,
  secteur_evenement text,
  type_evenement text,
  date_debut timestamptz NOT NULL,
  date_fin timestamptz,
  localisation_ville text,
  lieu text,
  prix text,
  lien_billetterie text,
  image_url text,
  telephone_contact text,
  organisateur text,
  est_annuel boolean DEFAULT false,
  niveau_abonnement text DEFAULT 'gratuit',
  est_valide boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Commentaires sur les colonnes
COMMENT ON COLUMN evenements_locaux.secteur_evenement IS 
'Secteur de l''événement (Art & Culture, Sorties, Sport & Aventure, Saveurs & Traditions, etc.)';

COMMENT ON COLUMN evenements_locaux.type_evenement IS 
'Type spécifique de l''événement (Concert, Festival, Plage, Restaurant, etc.)';

COMMENT ON COLUMN evenements_locaux.niveau_abonnement IS 
'Niveau de visibilité : gratuit, basic, premium, elite';

COMMENT ON COLUMN evenements_locaux.est_valide IS 
'Si true, l''événement est approuvé et visible publiquement. Par défaut true.';

-- Index pour optimisation des recherches
CREATE INDEX IF NOT EXISTS idx_evenements_locaux_secteur 
ON evenements_locaux(secteur_evenement) 
WHERE secteur_evenement IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evenements_locaux_date 
ON evenements_locaux(date_debut);

CREATE INDEX IF NOT EXISTS idx_evenements_locaux_ville 
ON evenements_locaux(localisation_ville) 
WHERE localisation_ville IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evenements_locaux_secteur_ville 
ON evenements_locaux(secteur_evenement, localisation_ville) 
WHERE secteur_evenement IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evenements_locaux_valide 
ON evenements_locaux(est_valide) 
WHERE est_valide = true;

-- Activer RLS
ALTER TABLE evenements_locaux ENABLE ROW LEVEL SECURITY;

-- Policy : Lecture publique pour tous les événements validés
CREATE POLICY "Allow public read access to validated evenements_locaux"
ON evenements_locaux FOR SELECT
TO public
USING (est_valide = true);

-- Policy : Lecture pour les admins (même non validés)
CREATE POLICY "Allow authenticated full read access to evenements_locaux"
ON evenements_locaux FOR SELECT
TO authenticated
USING (true);

-- Policy : Insertion pour utilisateurs authentifiés
CREATE POLICY "Allow authenticated insert on evenements_locaux"
ON evenements_locaux FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy : Modification pour utilisateurs authentifiés
CREATE POLICY "Allow authenticated update on evenements_locaux"
ON evenements_locaux FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy : Suppression pour utilisateurs authentifiés
CREATE POLICY "Allow authenticated delete on evenements_locaux"
ON evenements_locaux FOR DELETE
TO authenticated
USING (true);