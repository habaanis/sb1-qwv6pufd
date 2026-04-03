/*
  # Ajout de la colonne tags à la table entreprise

  1. Nouvelle Colonne
    - `tags` (text[]) - Tags pour catégorisation et recherche avancée

  2. Index
    - Index GIN sur tags pour recherche performante dans les tableaux

  3. Notes
    - La colonne mots_cles_recherche existe déjà
    - Cette colonne tags permettra une recherche encore plus précise
    - Exemple: "Dupont SARL" avec tags ["plomberie", "chauffage", "dépannage"] 
      sera trouvée pour "plombier", "chauffagiste" ou "dépannage"
*/

-- Ajouter la colonne tags (tableau de text)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entreprise' AND column_name = 'tags'
  ) THEN
    ALTER TABLE entreprise ADD COLUMN tags text[];
  END IF;
END $$;

-- Créer un index GIN pour recherche performante sur les tags
CREATE INDEX IF NOT EXISTS idx_entreprise_tags 
ON entreprise USING gin(tags);

-- Créer un index trigram sur mots_cles_recherche pour recherche floue
CREATE INDEX IF NOT EXISTS idx_entreprise_mots_cles_trgm 
ON entreprise USING gin(mots_cles_recherche gin_trgm_ops);

-- Créer un index trigram sur le nom pour recherche floue
CREATE INDEX IF NOT EXISTS idx_entreprise_nom_trgm 
ON entreprise USING gin(nom gin_trgm_ops);
