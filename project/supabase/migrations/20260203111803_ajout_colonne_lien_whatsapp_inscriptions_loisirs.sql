/*
  # Ajout Colonne Lien WhatsApp pour Contact Rapide

  ## 1. Nouvelle Colonne
    - Ajout de `lien_contact_whatsapp` (text) à la table `inscriptions_loisirs`
    - Cette colonne stockera le lien WhatsApp généré automatiquement

  ## 2. Format du Lien
    Le lien sera généré au format:
    https://wa.me/[NuméroWhatsApp]?text=Bonjour, je souhaite valider l'inscription de [Prénom] pour [NomEvenement]

  ## 3. Utilité
    - Facilite le contact admin → proposant
    - Génération automatique côté application
    - Affichage sous forme de bouton dans l'interface admin
*/

-- Ajouter la colonne lien_contact_whatsapp
ALTER TABLE inscriptions_loisirs 
ADD COLUMN IF NOT EXISTS lien_contact_whatsapp text;

-- Créer un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_inscriptions_loisirs_lien_whatsapp 
ON inscriptions_loisirs(lien_contact_whatsapp) 
WHERE lien_contact_whatsapp IS NOT NULL;
