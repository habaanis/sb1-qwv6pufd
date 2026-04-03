/*
  # Ajout de la colonne type_demande à suggestions_entreprises

  1. Modifications
    - Ajoute la colonne `type_demande` à la table `suggestions_entreprises`
    - Valeurs possibles: 'suggestion', 'inscription', 'transport', 'loisir'
    - Valeur par défaut: 'suggestion'
    - Index pour améliorer les performances des filtres par type

  2. Compatibilité
    - Les enregistrements existants auront automatiquement 'suggestion' comme valeur
    - Aucune donnée n'est perdue lors de cette migration
*/

-- Ajouter la colonne type_demande avec une valeur par défaut
ALTER TABLE suggestions_entreprises 
ADD COLUMN IF NOT EXISTS type_demande text NOT NULL DEFAULT 'suggestion' 
CHECK (type_demande IN ('suggestion', 'inscription', 'transport', 'loisir'));

-- Créer un index pour améliorer les performances des filtres par type
CREATE INDEX IF NOT EXISTS idx_suggestions_entreprises_type_demande 
ON suggestions_entreprises(type_demande);

-- Créer un index composé pour filtrer par type et statut ensemble
CREATE INDEX IF NOT EXISTS idx_suggestions_entreprises_type_statut 
ON suggestions_entreprises(type_demande, statut);