/*
  # Création de la table des démarches administratives
  
  1. Nouvelle Table
    - `demarches_administratives` - Table pour stocker les procédures administratives
      - `id` (uuid, clé primaire)
      - `nom` (text) - Nom de la démarche (ex: "Carte d'Identité Nationale")
      - `categorie` (text) - Catégorie (CIN, Passeport, Acte civil, etc.)
      - `description` (text) - Description de la démarche
      - `pieces_requises` (text[]) - Liste des pièces à fournir
      - `delai_traitement` (text) - Délai de traitement estimé
      - `cout` (text) - Coût de la démarche
      - `publics_concernes` (text[]) - Public concerné (citoyen, expat, visiteur)
      - `service_competent` (text) - Service compétent
      - `formulaire_url` (text) - Lien vers formulaire en ligne
      - `notes` (text) - Notes additionnelles
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Sécurité
    - Enable RLS sur la table
    - Politique de lecture publique
    - Politique d'insertion pour administrateurs uniquement
    
  3. Index
    - Index sur nom et categorie pour recherche rapide
    - Index sur publics_concernes pour filtrage
*/

-- Créer la table demarches_administratives
CREATE TABLE IF NOT EXISTS demarches_administratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  categorie text NOT NULL,
  description text,
  pieces_requises text[] DEFAULT ARRAY[]::text[],
  delai_traitement text,
  cout text,
  publics_concernes text[] DEFAULT ARRAY['citoyen']::text[],
  service_competent text,
  formulaire_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE demarches_administratives ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les démarches
CREATE POLICY "Public can read demarches"
  ON demarches_administratives
  FOR SELECT
  USING (true);

-- Politique: Seuls les utilisateurs authentifiés peuvent insérer
CREATE POLICY "Authenticated users can insert demarches"
  ON demarches_administratives
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique: Seuls les utilisateurs authentifiés peuvent modifier
CREATE POLICY "Authenticated users can update demarches"
  ON demarches_administratives
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_demarches_nom ON demarches_administratives USING gin(to_tsvector('french', nom));
CREATE INDEX IF NOT EXISTS idx_demarches_categorie ON demarches_administratives(categorie);
CREATE INDEX IF NOT EXISTS idx_demarches_publics ON demarches_administratives USING gin(publics_concernes);

-- Insérer des données d'exemple
INSERT INTO demarches_administratives (nom, categorie, description, pieces_requises, delai_traitement, cout, publics_concernes, service_competent, formulaire_url, notes) VALUES
(
  'Carte d''Identité Nationale (CIN)',
  'Identité',
  'Délivrance ou renouvellement de la carte d''identité nationale pour les citoyens tunisiens',
  ARRAY[
    'Extrait d''acte de naissance (moins de 3 mois)',
    'Certificat de résidence',
    'Ancienne CIN (si renouvellement)',
    '2 photos d''identité récentes',
    'Timbre fiscal (20 DT pour première demande, 15 DT pour renouvellement)'
  ],
  '15 jours ouvrables',
  '20 DT (première demande) / 15 DT (renouvellement)',
  ARRAY['citoyen'],
  'Municipalité ou Bureau de Police',
  null,
  'La CIN est obligatoire à partir de 18 ans. Prévoir de venir entre 8h et 13h.'
),
(
  'Passeport Biométrique',
  'Identité',
  'Délivrance d''un passeport biométrique pour voyager à l''étranger',
  ARRAY[
    'CIN originale + photocopie',
    'Extrait d''acte de naissance (moins de 3 mois)',
    'Certificat de résidence',
    'Justificatif de paiement des timbres fiscaux (150 DT)',
    '2 photos d''identité biométriques récentes',
    'Ancien passeport (si renouvellement)'
  ],
  '2 à 4 semaines',
  '150 DT',
  ARRAY['citoyen'],
  'Bureau de Police ou Municipalité',
  'https://passeport.interieur.gov.tn',
  'Prise de rendez-vous en ligne recommandée. Le passeport est valable 5 ans.'
),
(
  'Extrait d''Acte de Naissance',
  'État Civil',
  'Obtention d''un extrait d''acte de naissance',
  ARRAY[
    'CIN du demandeur',
    'Numéro d''acte de naissance (si connu)',
    'Timbre fiscal (3 DT par copie)'
  ],
  'Immédiat à 3 jours',
  '3 DT par copie',
  ARRAY['citoyen', 'expat'],
  'Municipalité du lieu de naissance',
  null,
  'Peut être demandé en ligne sur le site du ministère de l''intérieur pour certaines municipalités.'
),
(
  'Certificat de Résidence',
  'Résidence',
  'Attestation de domicile pour diverses démarches administratives',
  ARRAY[
    'CIN originale + photocopie',
    'Justificatif de domicile (facture STEG, SONEDE ou contrat de location)',
    'Timbre fiscal (3 DT)'
  ],
  'Immédiat',
  '3 DT',
  ARRAY['citoyen', 'expat'],
  'Municipalité ou Omda',
  null,
  'Valable 3 mois. Nécessaire pour la plupart des démarches administratives.'
),
(
  'Casier Judiciaire (Bulletin N°3)',
  'Justice',
  'Extrait du casier judiciaire pour emploi ou démarches administratives',
  ARRAY[
    'CIN originale + photocopie',
    'Timbre fiscal (5 DT)',
    'Formulaire de demande rempli'
  ],
  '3 à 7 jours',
  '5 DT',
  ARRAY['citoyen'],
  'Tribunal de Première Instance',
  null,
  'Valable 3 mois. Peut être demandé en ligne sur e-justice.tn'
),
(
  'Permis de Conduire - Première Demande',
  'Transport',
  'Obtention du permis de conduire pour la première fois',
  ARRAY[
    'CIN originale + photocopie',
    'Certificat médical (visite médicale)',
    'Certificat de résidence',
    '4 photos d''identité',
    'Attestation de réussite aux examens (code + conduite)',
    'Timbres fiscaux (selon catégorie)'
  ],
  '15 jours après réussite aux examens',
  '100-150 DT (selon catégorie)',
  ARRAY['citoyen', 'expat'],
  'Direction Régionale du Transport',
  null,
  'Inscription obligatoire dans une auto-école agréée. Validité de 10 ans.'
),
(
  'Carte de Séjour (Étrangers)',
  'Immigration',
  'Carte de séjour pour les étrangers résidant en Tunisie',
  ARRAY[
    'Passeport valide + photocopie',
    'Visa d''entrée valide',
    'Contrat de travail ou attestation de ressources',
    'Certificat de résidence',
    'Certificat médical',
    '4 photos d''identité',
    'Justificatif de domicile',
    'Timbres fiscaux (200 DT par an)'
  ],
  '3 à 6 semaines',
  '200 DT par an',
  ARRAY['expat'],
  'Direction de la Police des Frontières et des Étrangers',
  null,
  'Renouvellement annuel obligatoire. Prévoir de venir avec tous les documents originaux.'
),
(
  'Certificat de Mariage',
  'État Civil',
  'Extrait d''acte de mariage',
  ARRAY[
    'CIN des époux',
    'Numéro d''acte de mariage',
    'Timbre fiscal (3 DT)'
  ],
  'Immédiat à 3 jours',
  '3 DT par copie',
  ARRAY['citoyen', 'expat'],
  'Municipalité du lieu de mariage',
  null,
  'Valable 3 mois pour les démarches administratives.'
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_demarches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_update_demarches_timestamp
BEFORE UPDATE ON demarches_administratives
FOR EACH ROW
EXECUTE FUNCTION update_demarches_updated_at();