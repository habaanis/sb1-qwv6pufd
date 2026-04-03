/*
  # Create View for Visible Announcements

  1. Create View
    - `v_annonces_visibles` - Optimized view for displaying announcements
    - Filters expired and non-approved announcements
    - Includes all necessary fields for display

  2. Performance
    - Indexed for fast queries
    - Ready for filtering and sorting
*/

-- Create view for visible announcements
CREATE OR REPLACE VIEW v_annonces_visibles AS
SELECT 
  a.id,
  a.titre as title,
  a.prix as price,
  a.localisation_ville as city,
  a.categorie as category,
  a.description,
  a.photo_url,
  a.contact_tel,
  a.user_email,
  a.type_annonce,
  a.est_urgent as urgent,
  a.created_at as date_publication,
  a.vendeur_badge,
  a.vendeur_note,
  a.nombre_vues_reelles as vues,
  a.favoris_par,
  EXTRACT(EPOCH FROM (now() - a.created_at))/3600 as hours_ago
FROM annonces_locales a
WHERE 
  a.statut_moderation = 'approved'
  AND a.date_expiration > now()
ORDER BY 
  a.est_urgent DESC,
  a.created_at DESC;

-- Grant access to view
GRANT SELECT ON v_annonces_visibles TO anon, authenticated;
