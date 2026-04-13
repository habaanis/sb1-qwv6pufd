/*
  # Amélioration recherche avec scoring prioritaire
  
  1. Nouvelle fonction de recherche intelligente
    - Priorise catégorie/sous-catégories (score +10)
    - Puis nom de l'entreprise (score +5)
    - Enfin description/mots-clés (score +1)
    - Logique ET : métier ET ville
    - Insensible casse et accents via norm()
    - Tolérance fautes avec fuzzy (similarity)
    
  2. Paramètres
    - p_q: terme de recherche (métier)
    - p_ville: filtre ville/gouvernorat (optionnel)
    - p_categorie: filtre catégorie (optionnel)
    - p_scope: scope de page (optionnel)
    
  3. Retour
    - Résultats triés par pertinence
    - Score visible pour debug
*/

-- Fonction de recherche intelligente avec priorisation
CREATE OR REPLACE FUNCTION public.search_entreprise_smart(
  p_q text,
  p_ville text DEFAULT NULL,
  p_categorie text DEFAULT NULL,
  p_scope text DEFAULT NULL,
  p_limit int DEFAULT 30
)
RETURNS TABLE (
  id text,
  nom text,
  ville text,
  categorie text,
  sous_categories text,
  description text,
  telephone text,
  site_web text,
  image_url text,
  gouvernorat text,
  score numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH filtered AS (
    SELECT 
      e.*,
      -- Calcul du score de pertinence
      CASE
        -- Correspondance exacte dans catégorie (meilleur score)
        WHEN p_q IS NOT NULL AND norm(COALESCE(e.categorie, '')) = norm(p_q) THEN 100
        WHEN p_q IS NOT NULL AND norm(COALESCE(e.sous_categories, '')) = norm(p_q) THEN 100
        
        -- Commence par la recherche dans catégorie/sous-catégories
        WHEN p_q IS NOT NULL AND norm(COALESCE(e.categorie, '')) LIKE norm(p_q || '%') THEN 50
        WHEN p_q IS NOT NULL AND norm(COALESCE(e.sous_categories, '')) LIKE norm(p_q || '%') THEN 50
        
        -- Contient le terme dans catégorie/sous-catégories
        WHEN p_q IS NOT NULL AND norm(COALESCE(e.categorie, '')) LIKE norm('%' || p_q || '%') THEN 30
        WHEN p_q IS NOT NULL AND norm(COALESCE(e.sous_categories, '')) LIKE norm('%' || p_q || '%') THEN 30
        
        -- Fuzzy match dans catégorie (tolérance fautes)
        WHEN p_q IS NOT NULL AND similarity(norm(COALESCE(e.categorie, '')), norm(p_q)) > 0.3 THEN 25
        WHEN p_q IS NOT NULL AND similarity(norm(COALESCE(e.sous_categories, '')), norm(p_q)) > 0.3 THEN 25
        
        -- Nom de l'entreprise (score moyen)
        WHEN p_q IS NOT NULL AND norm(e.nom) = norm(p_q) THEN 20
        WHEN p_q IS NOT NULL AND norm(e.nom) LIKE norm(p_q || '%') THEN 15
        WHEN p_q IS NOT NULL AND norm(e.nom) LIKE norm('%' || p_q || '%') THEN 10
        WHEN p_q IS NOT NULL AND similarity(norm(e.nom), norm(p_q)) > 0.3 THEN 8
        
        -- Mots-clés et description (score bas)
        WHEN p_q IS NOT NULL AND norm(COALESCE(e."mots cles recherche", '')) LIKE norm('%' || p_q || '%') THEN 5
        WHEN p_q IS NOT NULL AND norm(COALESCE(e.description, '')) LIKE norm('%' || p_q || '%') THEN 2
        
        -- Pas de recherche = score neutre
        ELSE 0
      END AS relevance_score
    FROM public.entreprise e
    WHERE
      -- Filtre métier (si spécifié)
      (
        p_q IS NULL 
        OR length(trim(p_q)) < 2
        OR norm(e.nom) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e.categorie, '')) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e.sous_categories, '')) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e."mots cles recherche", '')) LIKE norm('%' || p_q || '%')
        OR norm(COALESCE(e.description, '')) LIKE norm('%' || p_q || '%')
        OR similarity(norm(e.nom), norm(p_q)) > 0.3
        OR similarity(norm(COALESCE(e.categorie, '')), norm(p_q)) > 0.3
        OR similarity(norm(COALESCE(e.sous_categories, '')), norm(p_q)) > 0.3
      )
      -- Filtre ville/gouvernorat (logique ET)
      AND (
        p_ville IS NULL 
        OR length(trim(p_ville)) = 0
        OR norm(COALESCE(e.ville, '')) LIKE norm('%' || p_ville || '%')
        OR norm(COALESCE(e.gouvernorat, '')) = norm(p_ville)
      )
      -- Filtre catégorie additionnelle
      AND (
        p_categorie IS NULL
        OR norm(COALESCE(e.categorie, '')) LIKE norm('%' || p_categorie || '%')
        OR norm(COALESCE(e.sous_categories, '')) LIKE norm('%' || p_categorie || '%')
      )
      -- Filtres de scope
      AND (
        p_scope IS NULL
        OR (p_scope = 'magasin' AND e."page commerce local" = true)
        OR (p_scope = 'tourism' AND e."liste pages" @> ARRAY['tourisme local & expatriation'])
        OR (p_scope = 'services' AND e."liste pages" @> ARRAY['services citoyens'])
        OR p_scope NOT IN ('magasin', 'tourism', 'services')
      )
  )
  SELECT 
    f.id,
    f.nom,
    f.ville,
    f.categorie,
    f.sous_categories,
    f.description,
    f.telephone,
    f.site_web,
    f.image_url,
    f.gouvernorat,
    f.relevance_score as score
  FROM filtered f
  WHERE f.relevance_score > 0 OR p_q IS NULL OR length(trim(p_q)) < 2
  ORDER BY f.relevance_score DESC, f.nom ASC
  LIMIT p_limit;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_entreprise_smart(text, text, text, text, int) TO anon, authenticated;
