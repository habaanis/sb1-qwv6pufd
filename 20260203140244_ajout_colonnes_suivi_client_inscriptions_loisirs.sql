/*
  # Ajout des colonnes de suivi client à inscriptions_loisirs

  ## 1. Contexte
    Cette migration ajoute les colonnes nécessaires pour le suivi client et la 
    synchronisation avec Airtable dans la table inscriptions_loisirs.

  ## 2. Colonnes Ajoutées
    Table: `inscriptions_loisirs`
    
    - `lien_billetterie` (text)
      → Lien spécifique généré pour le client (Whatsylync ou autre)
      → Permet de stocker l'URL de billetterie/réservation personnalisée
      → Nullable, sera rempli après validation de l'événement
    
    - `date_fin` (timestamptz)
      → Date de fin de l'événement choisi par le client
      → Permet de gérer les événements multi-jours
      → Nullable, optionnel pour les événements d'un jour
    
    Note: `statut_whatsylync` existe déjà (ajouté précédemment)

  ## 3. Sécurité RLS
    - Les colonnes héritent des policies existantes de la table
    - Lecture publique autorisée (pour affichage)
    - Écriture publique autorisée lors de l'insertion (pour soumission formulaire)
    - Modification restreinte aux admins authentifiés

  ## 4. Synchronisation Airtable
    - Toutes les colonnes sont exportables vers Airtable
    - Format compatible avec les webhooks
    - Nommage cohérent avec la structure Airtable

  ## 5. Index
    - Index créé sur date_fin pour optimiser les recherches par période
*/

-- Ajouter la colonne lien_billetterie
ALTER TABLE inscriptions_loisirs 
ADD COLUMN IF NOT EXISTS lien_billetterie text;

-- Ajouter la colonne date_fin
ALTER TABLE inscriptions_loisirs 
ADD COLUMN IF NOT EXISTS date_fin timestamptz;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN inscriptions_loisirs.lien_billetterie IS 
'Lien de billetterie/réservation personnalisé pour le client (Whatsylync ou externe)';

COMMENT ON COLUMN inscriptions_loisirs.date_fin IS 
'Date de fin de l''événement (optionnel, pour événements multi-jours)';

-- Créer un index pour optimiser les recherches par date de fin
CREATE INDEX IF NOT EXISTS idx_inscriptions_loisirs_date_fin 
ON inscriptions_loisirs(date_fin) 
WHERE date_fin IS NOT NULL;

-- Créer un index composé pour recherches par période
CREATE INDEX IF NOT EXISTS idx_inscriptions_loisirs_dates 
ON inscriptions_loisirs(date_prevue, date_fin) 
WHERE date_prevue IS NOT NULL;