/*
  # Ajout de contrainte sur secteur_evenement dans culture_events

  ## 1. Contexte
    L'utilisateur souhaite standardiser les valeurs de secteur_evenement
    dans la table culture_events pour accepter uniquement :
    - 'Art & Culture'
    - 'Sorties & Soirées'

  ## 2. Modifications
    - Mise à jour des données existantes pour utiliser les nouvelles valeurs
    - Ajout d'une contrainte CHECK pour valider les valeurs futures

  ## 3. Migration des Données
    Mapping des anciennes valeurs vers les nouvelles :
    - 'Festivals & artisanat' → 'Art & Culture'
    - 'Sport & Aventure' → 'Sorties & Soirées'
    - 'Musique', 'Théâtre', 'Cinéma', 'Art', 'Danse', 'Festival' → 'Art & Culture'

  ## 4. Contrainte
    CHECK pour garantir que seules ces deux valeurs sont acceptées
*/

-- Étape 1 : Mettre à jour les données existantes
UPDATE culture_events
SET secteur_evenement = CASE
  WHEN secteur_evenement IN ('Festivals & artisanat', 'Musique', 'Théâtre', 'Cinéma', 'Art', 'Danse', 'Festival') THEN 'Art & Culture'
  WHEN secteur_evenement IN ('Sport & Aventure') THEN 'Sorties & Soirées'
  ELSE secteur_evenement
END
WHERE secteur_evenement IS NOT NULL;

-- Étape 2 : Ajouter une contrainte CHECK
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'culture_events_secteur_check'
  ) THEN
    ALTER TABLE culture_events
    ADD CONSTRAINT culture_events_secteur_check
    CHECK (
      secteur_evenement IS NULL OR
      secteur_evenement IN ('Art & Culture', 'Sorties & Soirées')
    );
  END IF;
END $$;

-- Commentaire sur la contrainte
COMMENT ON CONSTRAINT culture_events_secteur_check ON culture_events IS
'Seules les valeurs Art & Culture et Sorties & Soirées sont acceptées pour secteur_evenement';

-- Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS idx_culture_events_secteur
ON culture_events(secteur_evenement)
WHERE secteur_evenement IS NOT NULL;