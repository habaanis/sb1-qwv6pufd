/*
  # Création de la table des prestataires de transport médical

  1. Nouvelle Table
    - `medical_transport_providers`
      - `id` (uuid, primary key) - Identifiant unique
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de dernière modification
      - `full_name` (text, required) - Nom complet du prestataire
      - `email` (text, required) - Adresse email
      - `phone` (text, required) - Numéro de téléphone
      - `governorate` (text, required) - Gouvernorat de service
      - `cities` (text) - Liste des villes desservies (ex: "Sfax, Thyna, ...")
      - `vehicle_type` (text, required) - Type de véhicule: voiture_standard, van_amenage, ambulance_privee
      - `equipment` (jsonb) - Équipements disponibles: {wheelchair, oxygen, stretcher}
      - `availability` (text) - Disponibilité: 24/7, jour, nuit, sur_rdv
      - `subscription_tier` (text) - Type d'abonnement: gratuit, premium
      - `notes` (text) - Notes additionnelles
      - `status` (text) - Statut de validation: pending, approved, rejected

  2. Trigger
    - Mise à jour automatique du champ `updated_at` à chaque modification

  3. Sécurité
    - Active RLS sur la table
    - Politique permettant l'insertion publique pour nouvelles demandes
    - Politique permettant la lecture publique des prestataires approuvés uniquement
    - Politique permettant aux prestataires de voir et modifier leurs propres données

  4. Index
    - Index sur governorate, status, subscription_tier pour optimiser les recherches
*/

-- Création de la table
CREATE TABLE IF NOT EXISTS public.medical_transport_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Données d'inscription
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  governorate text NOT NULL,
  cities text,

  vehicle_type text NOT NULL CHECK (vehicle_type IN ('voiture_standard', 'van_amenage', 'ambulance_privee')),
  equipment jsonb NOT NULL DEFAULT '{}'::jsonb,
  availability text NOT NULL DEFAULT '24/7',

  subscription_tier text NOT NULL DEFAULT 'gratuit' CHECK (subscription_tier IN ('gratuit', 'premium')),
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_medical_providers_governorate 
  ON public.medical_transport_providers(governorate);

CREATE INDEX IF NOT EXISTS idx_medical_providers_status 
  ON public.medical_transport_providers(status);

CREATE INDEX IF NOT EXISTS idx_medical_providers_subscription 
  ON public.medical_transport_providers(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_medical_providers_email 
  ON public.medical_transport_providers(email);

CREATE INDEX IF NOT EXISTS idx_medical_providers_vehicle_type 
  ON public.medical_transport_providers(vehicle_type);

-- Fonction pour mise à jour automatique du updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trg_medical_transport_providers_updated ON public.medical_transport_providers;
CREATE TRIGGER trg_medical_transport_providers_updated
  BEFORE UPDATE ON public.medical_transport_providers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Activer RLS
ALTER TABLE public.medical_transport_providers ENABLE ROW LEVEL SECURITY;

-- Politique: Insertion publique pour nouvelles demandes
DROP POLICY IF EXISTS "allow_insert_all" ON public.medical_transport_providers;
CREATE POLICY "allow_insert_all"
  ON public.medical_transport_providers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politique: Lecture publique des prestataires approuvés uniquement
DROP POLICY IF EXISTS "allow_select_approved" ON public.medical_transport_providers;
CREATE POLICY "allow_select_approved"
  ON public.medical_transport_providers
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Politique: Les prestataires authentifiés peuvent voir leurs propres données
DROP POLICY IF EXISTS "providers_view_own_data" ON public.medical_transport_providers;
CREATE POLICY "providers_view_own_data"
  ON public.medical_transport_providers
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Politique: Les prestataires authentifiés peuvent modifier leurs propres données
DROP POLICY IF EXISTS "providers_update_own_data" ON public.medical_transport_providers;
CREATE POLICY "providers_update_own_data"
  ON public.medical_transport_providers
  FOR UPDATE
  TO authenticated
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

-- Commentaires pour documentation
COMMENT ON TABLE public.medical_transport_providers IS 
  'Stocke les informations des prestataires de transport médical avec validation d''abonnement';

COMMENT ON COLUMN public.medical_transport_providers.vehicle_type IS 
  'Type de véhicule: voiture_standard (voiture adaptée), van_amenage (van aménagé), ambulance_privee (ambulance privée)';

COMMENT ON COLUMN public.medical_transport_providers.equipment IS 
  'Équipements disponibles au format JSON: {wheelchair: boolean, oxygen: boolean, stretcher: boolean}';

COMMENT ON COLUMN public.medical_transport_providers.availability IS 
  'Disponibilité du prestataire: 24/7 (24h/24), jour (journée uniquement), nuit (nuit uniquement), sur_rdv (sur rendez-vous)';

COMMENT ON COLUMN public.medical_transport_providers.subscription_tier IS 
  'Type d''abonnement: gratuit (fonctionnalités limitées) ou premium (fonctionnalités avancées)';

COMMENT ON COLUMN public.medical_transport_providers.status IS 
  'Statut de validation: pending (en attente), approved (approuvé et visible), rejected (refusé)';
