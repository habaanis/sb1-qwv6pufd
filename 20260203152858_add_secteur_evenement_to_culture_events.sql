/*
  # Ajout de la colonne secteur_evenement à culture_events

  ## 1. Contexte
    Cette migration ajoute une colonne pour catégoriser les événements culturels
    par secteur (musique, théâtre, cinéma, art, etc.), permettant un filtrage
    plus précis dans l'interface utilisateur.

  ## 2. Colonne Ajoutée
    Table: `culture_events`
    
    - `secteur_evenement` (text)
      → Secteur/catégorie de l'événement culturel
      → Ex: 'Musique', 'Théâtre', 'Cinéma', 'Art', 'Danse', 'Festival', etc.
      → Nullable, sera rempli progressivement pour les événements existants
      → Utilisé pour le filtre "Tous types" dans la barre de recherche

  ## 3. Index
    - Index créé sur secteur_evenement pour optimiser les recherches par secteur
    - Améliore les performances du filtre dans l'interface

  ## 4. Sécurité
    - La colonne hérite des policies RLS existantes de culture_events
    - Lecture publique pour affichage des événements
    - Modification restreinte selon les policies existantes
*/

-- Ajouter la colonne secteur_evenement
ALTER TABLE culture_events 
ADD COLUMN IF NOT EXISTS secteur_evenement text;

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN culture_events.secteur_evenement IS 
'Secteur ou catégorie de l''événement culturel (Musique, Théâtre, Cinéma, Art, Danse, Festival, etc.)';

-- Créer un index pour optimiser les recherches par secteur
CREATE INDEX IF NOT EXISTS idx_culture_events_secteur 
ON culture_events(secteur_evenement) 
WHERE secteur_evenement IS NOT NULL;

-- Créer un index composé pour recherches par secteur et ville
CREATE INDEX IF NOT EXISTS idx_culture_events_secteur_ville 
ON culture_events(secteur_evenement, ville) 
WHERE secteur_evenement IS NOT NULL;