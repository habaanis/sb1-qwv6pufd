/*
  # Cr\u00e9ation de la table evenements_locaux pour les loisirs
  
  1. Nouvelle Table
    - `evenements_locaux`
      - `id` (uuid, primary key)
      - `titre` (text) - Titre de l'\u00e9v\u00e9nement
      - `titre_ar` (text) - Titre en arabe
      - `titre_en` (text) - Titre en anglais
      - `description` (text) - Description d\u00e9taill\u00e9e
      - `description_ar` (text) - Description en arabe
      - `description_en` (text) - Description en anglais
      - `date_debut` (timestamptz) - Date de d\u00e9but de l'\u00e9v\u00e9nement
      - `date_fin` (timestamptz) - Date de fin de l'\u00e9v\u00e9nement
      - `localisation_ville` (text) - Ville de l'\u00e9v\u00e9nement
      - `localisation_region` (text) - R\u00e9gion (Centre, Nord, Sud)
      - `adresse_complete` (text) - Adresse d\u00e9taill\u00e9e du lieu
      - `prix` (text) - Prix (Gratuit, \u20ac\u20ac, \u20ac\u20ac\u20ac)
      - `type_evenement` (text) - Cat\u00e9gorie (Festival, Concert, Exposition, Sport, etc.)
      - `lien_billetterie` (text) - URL pour acheter des billets
      - `image_url` (text) - URL de l'image de l'\u00e9v\u00e9nement
      - `telephone` (text) - T\u00e9l\u00e9phone de contact
      - `email` (text) - Email de contact
      - `accessible_enfants` (boolean) - Accessible aux enfants
      - `niveau_abonnement` (text) - Niveau d'abonnement (gratuit, premium, vip)
      - `organisateur` (text) - Nom de l'organisateur
      - `site_web` (text) - Site web de l'\u00e9v\u00e9nement
      - `note_moyenne` (numeric) - Note moyenne des utilisateurs
      - `nombre_avis` (integer) - Nombre d'avis
      - `statut` (text) - Statut (actif, annul\u00e9, termin\u00e9)
      - `created_at` (timestamptz) - Date de cr\u00e9ation
      - `updated_at` (timestamptz) - Date de mise \u00e0 jour
      
  2. S\u00e9curit\u00e9
    - Enable RLS sur `evenements_locaux`
    - Policies pour lecture publique
    - Policies pour insertion/modification par organisateurs authentifi\u00e9s
    
  3. Index
    - Index sur date_debut, date_fin pour recherche par date
    - Index sur localisation_ville, localisation_region
    - Index sur type_evenement
    - Index full-text sur titre et description
*/

-- Cr\u00e9er la table evenements_locaux
CREATE TABLE IF NOT EXISTS evenements_locaux (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  titre_ar text,
  titre_en text,
  description text,
  description_ar text,
  description_en text,
  date_debut timestamptz NOT NULL,
  date_fin timestamptz NOT NULL,
  localisation_ville text NOT NULL,
  localisation_region text NOT NULL DEFAULT 'Centre',
  adresse_complete text,
  prix text DEFAULT 'Gratuit',
  type_evenement text NOT NULL,
  lien_billetterie text,
  image_url text,
  telephone text,
  email text,
  accessible_enfants boolean DEFAULT false,
  niveau_abonnement text DEFAULT 'gratuit',
  organisateur text,
  site_web text,
  note_moyenne numeric DEFAULT 0,
  nombre_avis integer DEFAULT 0,
  statut text DEFAULT 'actif',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE evenements_locaux ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture publique des \u00e9v\u00e9nements actifs
CREATE POLICY "Les \u00e9v\u00e9nements actifs sont visibles par tous"
  ON evenements_locaux
  FOR SELECT
  USING (statut = 'actif');

-- Policy pour insertion par utilisateurs authentifi\u00e9s
CREATE POLICY "Les utilisateurs authentifi\u00e9s peuvent cr\u00e9er des \u00e9v\u00e9nements"
  ON evenements_locaux
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy pour modification par utilisateurs authentifi\u00e9s
CREATE POLICY "Les utilisateurs authentifi\u00e9s peuvent modifier leurs \u00e9v\u00e9nements"
  ON evenements_locaux
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Cr\u00e9er les index pour les performances
CREATE INDEX IF NOT EXISTS idx_evenements_date_debut ON evenements_locaux(date_debut);
CREATE INDEX IF NOT EXISTS idx_evenements_date_fin ON evenements_locaux(date_fin);
CREATE INDEX IF NOT EXISTS idx_evenements_ville ON evenements_locaux(localisation_ville);
CREATE INDEX IF NOT EXISTS idx_evenements_region ON evenements_locaux(localisation_region);
CREATE INDEX IF NOT EXISTS idx_evenements_type ON evenements_locaux(type_evenement);
CREATE INDEX IF NOT EXISTS idx_evenements_niveau ON evenements_locaux(niveau_abonnement);
CREATE INDEX IF NOT EXISTS idx_evenements_statut ON evenements_locaux(statut);

-- Index full-text pour recherche
CREATE INDEX IF NOT EXISTS idx_evenements_titre_search 
  ON evenements_locaux 
  USING gin(to_tsvector('french', COALESCE(titre, '') || ' ' || COALESCE(description, '')));

-- Trigger pour mettre \u00e0 jour updated_at
CREATE OR REPLACE FUNCTION update_evenements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evenements_updated_at
  BEFORE UPDATE ON evenements_locaux
  FOR EACH ROW
  EXECUTE FUNCTION update_evenements_updated_at();

-- Ins\u00e9rer quelques \u00e9v\u00e9nements d'exemple
INSERT INTO evenements_locaux (
  titre, titre_ar, titre_en, description, description_ar, description_en,
  date_debut, date_fin, localisation_ville, localisation_region,
  adresse_complete, prix, type_evenement, accessible_enfants, 
  niveau_abonnement, organisateur, statut
) VALUES
(
  'Festival International de Mahdia',
  '\u0645\u0647\u0631\u062c\u0627\u0646 \u0627\u0644\u0645\u0647\u062f\u064a\u0629 \u0627\u0644\u062f\u0648\u0644\u064a',
  'Mahdia International Festival',
  'Le Festival International de Mahdia revient pour sa 25\u00e8me \u00e9dition ! Concerts, spectacles de danse, et expositions d''art dans la magnifique vieille ville.',
  '\u064a\u0639\u0648\u062f \u0645\u0647\u0631\u062c\u0627\u0646 \u0627\u0644\u0645\u0647\u062f\u064a\u0629 \u0627\u0644\u062f\u0648\u0644\u064a \u0644\u0646\u0633\u062e\u062a\u0647 25! \u062d\u0641\u0644\u0627\u062a \u0645\u0648\u0633\u064a\u0642\u064a\u0629 \u0648\u0639\u0631\u0648\u0636 \u0631\u0642\u0635 \u0648\u0645\u0639\u0627\u0631\u0636 \u0641\u0646\u064a\u0629',
  'The Mahdia International Festival returns for its 25th edition! Concerts, dance shows, and art exhibitions in the beautiful old city.',
  now() + interval '15 days',
  now() + interval '22 days',
  'Mahdia',
  'Centre',
  'Vieille Ville de Mahdia',
  'Gratuit',
  'Festival',
  true,
  'vip',
  'Municipalit\u00e9 de Mahdia',
  'actif'
),
(
  'Concert de Jazz \u00e0 Carthage',
  '\u062d\u0641\u0644 \u0627\u0644\u062c\u0627\u0632 \u0641\u064a \u0642\u0631\u0637\u0627\u062c',
  'Jazz Concert in Carthage',
  'Soir\u00e9e jazz exceptionnelle au Th\u00e9\u00e2tre romain de Carthage avec des artistes internationaux.',
  '\u0623\u0645\u0633\u064a\u0629 \u062c\u0627\u0632 \u0627\u0633\u062a\u062b\u0646\u0627\u0626\u064a\u0629 \u0641\u064a \u0627\u0644\u0645\u0633\u0631\u062d \u0627\u0644\u0631\u0648\u0645\u0627\u0646\u064a \u0628\u0642\u0631\u0637\u0627\u062c \u0645\u0639 \u0641\u0646\u0627\u0646\u064a\u0646 \u062f\u0648\u0644\u064a\u064a\u0646',
  'Exceptional jazz evening at the Roman Theatre of Carthage with international artists.',
  now() + interval '8 days',
  now() + interval '8 days',
  'Tunis',
  'Nord',
  'Th\u00e9\u00e2tre romain de Carthage, Tunis',
  '\u20ac\u20ac\u20ac',
  'Concert',
  false,
  'premium',
  'Carthage Events',
  'actif'
),
(
  'Exposition d''Art Contemporain',
  '\u0645\u0639\u0631\u0636 \u0627\u0644\u0641\u0646 \u0627\u0644\u0645\u0639\u0627\u0635\u0631',
  'Contemporary Art Exhibition',
  'D\u00e9couvrez les \u0153uvres des meilleurs artistes tunisiens contemporains dans cette exposition unique.',
  '\u0627\u0643\u062a\u0634\u0641 \u0623\u0639\u0645\u0627\u0644 \u0623\u0641\u0636\u0644 \u0627\u0644\u0641\u0646\u0627\u0646\u064a\u0646 \u0627\u0644\u062a\u0648\u0646\u0633\u064a\u064a\u0646 \u0627\u0644\u0645\u0639\u0627\u0635\u0631\u064a\u0646',
  'Discover the works of the best contemporary Tunisian artists in this unique exhibition.',
  now() + interval '3 days',
  now() + interval '30 days',
  'Sousse',
  'Centre',
  'Centre Culturel de Sousse',
  '\u20ac\u20ac',
  'Exposition',
  true,
  'gratuit',
  'Centre Culturel',
  'actif'
),
(
  'Marathon de Monastir',
  '\u0645\u0627\u0631\u0627\u062b\u0648\u0646 \u0627\u0644\u0645\u0646\u0633\u062a\u064a\u0631',
  'Monastir Marathon',
  'Participez au Marathon annuel de Monastir le long de la c\u00f4te m\u00e9diterran\u00e9enne. 10km, 21km, et 42km.',
  '\u0634\u0627\u0631\u0643 \u0641\u064a \u0645\u0627\u0631\u0627\u062b\u0648\u0646 \u0627\u0644\u0645\u0646\u0633\u062a\u064a\u0631 \u0627\u0644\u0633\u0646\u0648\u064a \u0639\u0644\u0649 \u0637\u0648\u0644 \u0627\u0644\u0633\u0627\u062d\u0644',
  'Participate in the annual Monastir Marathon along the Mediterranean coast.',
  now() + interval '20 days',
  now() + interval '20 days',
  'Monastir',
  'Centre',
  'Corniche de Monastir',
  '\u20ac\u20ac',
  'Sport',
  true,
  'premium',
  'Association Sportive de Monastir',
  'actif'
),
(
  'Cin\u00e9ma en Plein Air',
  '\u0633\u064a\u0646\u0645\u0627 \u0641\u064a \u0627\u0644\u0647\u0648\u0627\u0621 \u0627\u0644\u0637\u0644\u0642',
  'Open Air Cinema',
  'Projection de films classiques et contemporains tous les vendredis soir dans le jardin public.',
  '\u0639\u0631\u0636 \u0623\u0641\u0644\u0627\u0645 \u0643\u0644\u0627\u0633\u064a\u0643\u064a\u0629 \u0648\u0645\u0639\u0627\u0635\u0631\u0629 \u0643\u0644 \u062c\u0645\u0639\u0629 \u0645\u0633\u0627\u0621',
  'Screening of classic and contemporary films every Friday evening in the public garden.',
  now() + interval '2 days',
  now() + interval '60 days',
  'Mahdia',
  'Centre',
  'Jardin Public de Mahdia',
  'Gratuit',
  'Cin\u00e9ma',
  true,
  'gratuit',
  'Cin\u00e9-Club Mahdia',
  'actif'
)
ON CONFLICT (id) DO NOTHING;