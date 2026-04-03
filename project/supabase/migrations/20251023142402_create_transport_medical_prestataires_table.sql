/*
  # Création de la table des prestataires de transport médical

  1. Nouvelle Table
    - `transport_medical_prestataires`
      - `id` (uuid, primary key) - Identifiant unique
      - `nom` (text, required) - Nom du prestataire
      - `telephone` (text, required) - Numéro de téléphone
      - `email` (text, required) - Adresse email
      - `ville` (text) - Ville du prestataire
      - `gouvernorat` (text) - Gouvernorat
      - `type_vehicule` (text) - Type de véhicule (ambulance, VSL, etc.)
      - `description` (text) - Description des services
      - `abonnement` (text) - Type d'abonnement: 'gratuit' ou 'premium'
      - `statut` (text) - Statut de la demande: 'en_attente', 'approuvé', 'refusé'
      - `payment_status` (text) - Statut du paiement: 'non_payé', 'payé', 'en_attente'
      - `created_at` (timestamptz) - Date de création

  2. Sécurité
    - Active RLS sur la table
    - Politique permettant la lecture publique des prestataires approuvés
    - Politique permettant l'insertion publique pour les nouvelles demandes
    - Politique permettant aux prestataires de voir et modifier leurs propres données
*/

-- Création de la table
CREATE TABLE IF NOT EXISTS public.transport_medical_prestataires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  telephone text NOT NULL,
  email text NOT NULL,
  ville text,
  gouvernorat text,
  type_vehicule text,
  description text,
  abonnement text CHECK (abonnement IN ('gratuit', 'premium')) DEFAULT 'gratuit',
  statut text DEFAULT 'en_attente',
  payment_status text DEFAULT 'non_payé',
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_transport_prestataires_ville 
  ON public.transport_medical_prestataires(ville);

CREATE INDEX IF NOT EXISTS idx_transport_prestataires_gouvernorat 
  ON public.transport_medical_prestataires(gouvernorat);

CREATE INDEX IF NOT EXISTS idx_transport_prestataires_statut 
  ON public.transport_medical_prestataires(statut);

CREATE INDEX IF NOT EXISTS idx_transport_prestataires_abonnement 
  ON public.transport_medical_prestataires(abonnement);

CREATE INDEX IF NOT EXISTS idx_transport_prestataires_email 
  ON public.transport_medical_prestataires(email);

-- Activer RLS
ALTER TABLE public.transport_medical_prestataires ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique des prestataires approuvés
CREATE POLICY "Lecture publique prestataires approuvés"
  ON public.transport_medical_prestataires
  FOR SELECT
  USING (statut = 'approuvé');

-- Politique: Insertion publique pour nouvelles demandes
CREATE POLICY "Insertion publique nouvelles demandes"
  ON public.transport_medical_prestataires
  FOR INSERT
  WITH CHECK (true);

-- Politique: Les prestataires peuvent voir leurs propres données
CREATE POLICY "Voir ses propres données"
  ON public.transport_medical_prestataires
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Politique: Les prestataires peuvent modifier leurs propres données
CREATE POLICY "Modifier ses propres données"
  ON public.transport_medical_prestataires
  FOR UPDATE
  TO authenticated
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

-- Commentaires pour documentation
COMMENT ON TABLE public.transport_medical_prestataires IS 
  'Stocke les informations des prestataires de transport médical avec leurs abonnements';

COMMENT ON COLUMN public.transport_medical_prestataires.abonnement IS 
  'Type d''abonnement: gratuit (limité) ou premium (fonctionnalités avancées)';

COMMENT ON COLUMN public.transport_medical_prestataires.statut IS 
  'Statut de la demande: en_attente (à valider), approuvé (actif), refusé (rejeté)';

COMMENT ON COLUMN public.transport_medical_prestataires.payment_status IS 
  'Statut du paiement pour les abonnements premium: non_payé, payé, en_attente';
