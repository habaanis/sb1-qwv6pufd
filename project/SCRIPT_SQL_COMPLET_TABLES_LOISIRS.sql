-- =============================================================================
-- SCRIPT SQL COMPLET POUR LES TABLES ENTREPRISE ET EVENEMENTS_LOCAUX
-- À exécuter dans l'Éditeur SQL de Supabase
-- =============================================================================

-- =============================================================================
-- 1. TABLE ENTREPRISE (pour les lieux permanents: restaurants, musées, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS entreprise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  nom text NOT NULL,
  ville text NOT NULL,
  categorie text,
  sous_categories text,
  secteur text,

  -- Coordonnées et contact
  adresse text,
  telephone text,
  email text,
  site_web text,

  -- Description et média
  description text,
  image_url text,

  -- Géolocalisation
  latitude numeric(10,7),
  longitude numeric(10,7),

  -- Statut et vérification
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  verified boolean DEFAULT false,
  is_premium boolean DEFAULT false,

  -- Horodatage
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table entreprise
ALTER TABLE entreprise ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique des établissements approuvés
DROP POLICY IF EXISTS "Public can read approved entreprise" ON entreprise;
CREATE POLICY "Public can read approved entreprise"
  ON entreprise
  FOR SELECT
  USING (status = 'approved');

-- Politique: Utilisateurs authentifiés peuvent insérer
DROP POLICY IF EXISTS "Authenticated users can insert entreprise" ON entreprise;
CREATE POLICY "Authenticated users can insert entreprise"
  ON entreprise
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique: Utilisateurs authentifiés peuvent mettre à jour
DROP POLICY IF EXISTS "Authenticated users can update entreprise" ON entreprise;
CREATE POLICY "Authenticated users can update entreprise"
  ON entreprise
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_entreprise_status ON entreprise(status);
CREATE INDEX IF NOT EXISTS idx_entreprise_ville ON entreprise(ville);
CREATE INDEX IF NOT EXISTS idx_entreprise_categorie ON entreprise(categorie);
CREATE INDEX IF NOT EXISTS idx_entreprise_secteur ON entreprise(secteur);
CREATE INDEX IF NOT EXISTS idx_entreprise_is_premium ON entreprise(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_entreprise_gps ON entreprise(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_entreprise_search ON entreprise USING gin(to_tsvector('french', nom || ' ' || COALESCE(description, '') || ' ' || ville || ' ' || COALESCE(categorie, '')));

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_entreprise_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_entreprise_updated_at ON entreprise;
CREATE TRIGGER trigger_update_entreprise_updated_at
  BEFORE UPDATE ON entreprise
  FOR EACH ROW
  EXECUTE FUNCTION update_entreprise_updated_at();

-- =============================================================================
-- DONNÉES D'EXEMPLE POUR LA TABLE ENTREPRISE (Secteur Loisirs)
-- =============================================================================

INSERT INTO entreprise (nom, ville, categorie, sous_categories, secteur, adresse, telephone, description, latitude, longitude, is_premium, status) VALUES
('Restaurant Dar El Jeld', 'Tunis', 'Restaurant', 'Restaurant', 'Loisirs & Événements', '10 Rue Dar El Jeld, Médina de Tunis', '+216 71 560 916', 'Restaurant traditionnel tunisien dans un magnifique palais de la médina', 36.8002, 10.1738, true, 'approved'),
('Musée du Bardo', 'Tunis', 'Musée', 'Musée', 'Loisirs & Événements', 'Le Bardo, Tunis', '+216 71 513 650', 'Le plus grand musée de Tunisie, célèbre pour ses mosaïques romaines', 36.8095, 10.1360, true, 'approved'),
('Café des Délices', 'Sidi Bou Said', 'Restaurant', 'Restaurant', 'Loisirs & Événements', 'Rue Hedi Zarrouk, Sidi Bou Said', '+216 71 740 407', 'Café mythique avec vue panoramique sur la Méditerranée', 36.8685, 10.3420, true, 'approved'),
('Hôtel Dar Hi', 'Nefta', 'Hébergement', 'Hébergement', 'Loisirs & Événements', 'Route de la Corbeille, Nefta', '+216 76 430 588', 'Hôtel design au cœur du désert tunisien', 33.8734, 7.8772, true, 'approved'),
('Plage de La Marsa', 'La Marsa', 'Plage', 'Sport', 'Loisirs & Événements', 'Corniche de La Marsa', '', 'Belle plage de sable fin prisée des familles', 36.8804, 10.3264, false, 'approved'),
('Club de Tennis Ezzahra', 'Ezzahra', 'Sport', 'Sport', 'Loisirs & Événements', 'Avenue Habib Bourguiba, Ezzahra', '+216 71 452 789', 'Club sportif avec terrains de tennis et équipements', 36.7536, 10.3094, false, 'approved')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. TABLE EVENEMENTS_LOCAUX (pour les événements: festivals, concerts, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS evenements_locaux (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Titre multilingue
  titre text NOT NULL,
  titre_ar text,
  titre_en text,

  -- Description multilingue
  description text,
  description_ar text,
  description_en text,

  -- Dates
  date_debut timestamptz NOT NULL,
  date_fin timestamptz NOT NULL,

  -- Localisation
  localisation_ville text NOT NULL,
  localisation_region text NOT NULL DEFAULT 'Centre',
  adresse_complete text,

  -- Informations pratiques
  prix text DEFAULT 'Gratuit',
  type_evenement text NOT NULL,
  lien_billetterie text,
  image_url text,

  -- Contact
  telephone text,
  email text,
  site_web text,

  -- Caractéristiques
  accessible_enfants boolean DEFAULT false,
  niveau_abonnement text DEFAULT 'gratuit' CHECK (niveau_abonnement IN ('gratuit', 'premium', 'vip')),
  secteur_evenement text NOT NULL DEFAULT 'Loisirs & Événements' CHECK (secteur_evenement IN ('Loisirs & Événements', 'education', 'entreprise')),

  -- Organisateur
  organisateur text,

  -- Avis et notes
  note_moyenne numeric DEFAULT 0,
  nombre_avis integer DEFAULT 0,

  -- Statut
  statut text DEFAULT 'actif' CHECK (statut IN ('actif', 'annule', 'termine')),

  -- Horodatage
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table evenements_locaux
ALTER TABLE evenements_locaux ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique des événements actifs
DROP POLICY IF EXISTS "Les evenements actifs sont visibles par tous" ON evenements_locaux;
CREATE POLICY "Les evenements actifs sont visibles par tous"
  ON evenements_locaux
  FOR SELECT
  USING (statut = 'actif');

-- Politique: Utilisateurs authentifiés peuvent créer des événements
DROP POLICY IF EXISTS "Les utilisateurs authentifies peuvent creer des evenements" ON evenements_locaux;
CREATE POLICY "Les utilisateurs authentifies peuvent creer des evenements"
  ON evenements_locaux
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique: Utilisateurs authentifiés peuvent modifier leurs événements
DROP POLICY IF EXISTS "Les utilisateurs authentifies peuvent modifier leurs evenements" ON evenements_locaux;
CREATE POLICY "Les utilisateurs authentifies peuvent modifier leurs evenements"
  ON evenements_locaux
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_evenements_date_debut ON evenements_locaux(date_debut);
CREATE INDEX IF NOT EXISTS idx_evenements_date_fin ON evenements_locaux(date_fin);
CREATE INDEX IF NOT EXISTS idx_evenements_ville ON evenements_locaux(localisation_ville);
CREATE INDEX IF NOT EXISTS idx_evenements_region ON evenements_locaux(localisation_region);
CREATE INDEX IF NOT EXISTS idx_evenements_type ON evenements_locaux(type_evenement);
CREATE INDEX IF NOT EXISTS idx_evenements_niveau ON evenements_locaux(niveau_abonnement);
CREATE INDEX IF NOT EXISTS idx_evenements_statut ON evenements_locaux(statut);
CREATE INDEX IF NOT EXISTS idx_evenements_secteur ON evenements_locaux(secteur_evenement);
CREATE INDEX IF NOT EXISTS idx_evenements_titre_search ON evenements_locaux USING gin(to_tsvector('french', COALESCE(titre, '') || ' ' || COALESCE(description, '')));

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_evenements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_evenements_updated_at ON evenements_locaux;
CREATE TRIGGER trigger_update_evenements_updated_at
  BEFORE UPDATE ON evenements_locaux
  FOR EACH ROW
  EXECUTE FUNCTION update_evenements_updated_at();

-- =============================================================================
-- DONNÉES D'EXEMPLE POUR LA TABLE EVENEMENTS_LOCAUX (Secteur Loisirs)
-- =============================================================================

INSERT INTO evenements_locaux (
  titre, titre_ar, titre_en,
  description, description_ar, description_en,
  date_debut, date_fin,
  localisation_ville, localisation_region,
  adresse_complete, prix, type_evenement,
  accessible_enfants, niveau_abonnement, secteur_evenement,
  organisateur, statut
) VALUES
(
  'Festival International de Mahdia',
  'مهرجان المهدية الدولي',
  'Mahdia International Festival',
  'Le Festival International de Mahdia revient pour sa 25ème édition ! Concerts, spectacles de danse, et expositions d''art dans la magnifique vieille ville.',
  'يعود مهرجان المهدية الدولي لنسخته 25! حفلات موسيقية وعروض رقص ومعارض فنية',
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
  'Loisirs & Événements',
  'Municipalité de Mahdia',
  'actif'
),
(
  'Concert de Jazz à Carthage',
  'حفل الجاز في قرطاج',
  'Jazz Concert in Carthage',
  'Soirée jazz exceptionnelle au Théâtre romain de Carthage avec des artistes internationaux.',
  'أمسية جاز استثنائية في المسرح الروماني بقرطاج مع فنانين دوليين',
  'Exceptional jazz evening at the Roman Theatre of Carthage with international artists.',
  now() + interval '8 days',
  now() + interval '8 days',
  'Tunis',
  'Nord',
  'Théâtre romain de Carthage, Tunis',
  '€€€',
  'Concert',
  false,
  'premium',
  'Loisirs & Événements',
  'Carthage Events',
  'actif'
),
(
  'Exposition d''Art Contemporain',
  'معرض الفن المعاصر',
  'Contemporary Art Exhibition',
  'Découvrez les œuvres des meilleurs artistes tunisiens contemporains dans cette exposition unique.',
  'اكتشف أعمال أفضل الفنانين التونسيين المعاصرين',
  'Discover the works of the best contemporary Tunisian artists in this unique exhibition.',
  now() + interval '3 days',
  now() + interval '30 days',
  'Sousse',
  'Centre',
  'Centre Culturel de Sousse',
  '€€',
  'Exposition',
  true,
  'gratuit',
  'Loisirs & Événements',
  'Centre Culturel',
  'actif'
),
(
  'Marathon de Monastir',
  'ماراثون المنستير',
  'Monastir Marathon',
  'Participez au Marathon annuel de Monastir le long de la côte méditerranéenne. 10km, 21km, et 42km.',
  'شارك في ماراثون المنستير السنوي على طول الساحل',
  'Participate in the annual Monastir Marathon along the Mediterranean coast.',
  now() + interval '20 days',
  now() + interval '20 days',
  'Monastir',
  'Centre',
  'Corniche de Monastir',
  '€€',
  'Sport',
  true,
  'premium',
  'Loisirs & Événements',
  'Association Sportive de Monastir',
  'actif'
),
(
  'Cinéma en Plein Air',
  'سينما في الهواء الطلق',
  'Open Air Cinema',
  'Projection de films classiques et contemporains tous les vendredis soir dans le jardin public.',
  'عرض أفلام كلاسيكية ومعاصرة كل جمعة مساء',
  'Screening of classic and contemporary films every Friday evening in the public garden.',
  now() + interval '2 days',
  now() + interval '60 days',
  'Mahdia',
  'Centre',
  'Jardin Public de Mahdia',
  'Gratuit',
  'Cinéma',
  true,
  'gratuit',
  'Loisirs & Événements',
  'Ciné-Club Mahdia',
  'actif'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================

-- Vérification finale : afficher le nombre d'enregistrements
SELECT
  'entreprise' as table_name,
  COUNT(*) as total_records
FROM entreprise
UNION ALL
SELECT
  'evenements_locaux' as table_name,
  COUNT(*) as total_records
FROM evenements_locaux;
