/*
  # Ajout des colonnes prix et lien_billetterie à culture_events

  ## Modifications
  
  1. Nouvelles colonnes
    - `prix` (text) - Prix de l'événement (ex: "Gratuit", "20 DT", "15-50 DT")
    - `lien_billetterie` (text) - URL vers la page de réservation/billetterie
    
  ## Notes
  - Ces colonnes permettent l'affichage du prix et l'accès direct à la billetterie
  - Le bouton "Voir détails" devient "Réserver/Billetterie" quand le lien existe
*/

-- Ajouter la colonne prix
ALTER TABLE culture_events 
ADD COLUMN IF NOT EXISTS prix text;

-- Ajouter la colonne lien_billetterie
ALTER TABLE culture_events 
ADD COLUMN IF NOT EXISTS lien_billetterie text;

-- Ajouter des événements de test pour chaque cadre temporel
INSERT INTO culture_events (
  titre, ville, date_debut, date_fin,
  categorie, image_url, prix, lien_billetterie,
  est_annuel, description_courte, type_affichage
) VALUES 
(
  'Soirée Jazz & Blues',
  'Tunis',
  NOW() + INTERVAL '4 days',
  NOW() + INTERVAL '4 days' + INTERVAL '3 hours',
  'Concert',
  'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600',
  '25 DT',
  'https://www.facebook.com/events/example-jazz-blues',
  false,
  'Une soirée musicale exceptionnelle avec les meilleurs artistes de jazz tunisiens.',
  'hebdo'
),
(
  'Marathon de Carthage',
  'Carthage',
  NOW() + INTERVAL '20 days',
  NOW() + INTERVAL '20 days',
  'Sport',
  'https://images.pexels.com/photos/2444429/pexels-photo-2444429.jpeg?auto=compress&cs=tinysrgb&w=600',
  '50 DT',
  'https://www.marathoncarthage.tn',
  false,
  'Courez à travers l''histoire ! Marathon 42km et semi-marathon 21km.',
  'mensuel'
),
(
  'Festival International de Carthage',
  'Carthage',
  NOW() + INTERVAL '150 days',
  NOW() + INTERVAL '210 days',
  'Festival',
  'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600',
  '30-100 DT',
  'https://www.festivalcarthage.tn',
  true,
  'Le plus prestigieux festival culturel de Tunisie, spectacles internationaux au théâtre romain.',
  'annuel'
) ON CONFLICT (id) DO NOTHING;