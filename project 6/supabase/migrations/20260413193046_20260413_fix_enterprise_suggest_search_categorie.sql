/*
  # Correction de enterprise_suggest_filtered : recherche sur catégorie

  ## Problème
  La fonction enterprise_suggest_filtered ne cherchait que sur le champ `nom`.
  Résultat : taper "dent" ne proposait que des entreprises dont le nom contient "dent",
  mais pas les dentistes dont la catégorie contient "Dentiste" ou "Soins dentaires".

  ## Correction
  Ajout de la recherche sur la colonne `"catégorie"` (tableau TEXT[]) :
  - Chaque mot du tableau est comparé avec le terme saisi
  - Même logique unaccent/norm que pour le nom

  ## Colonnes concernées
  - `"catégorie"` : TEXT[] - tableau de catégories de l'entreprise

  ## Ordre de priorité des résultats
  1. Nom commence par le terme (score 0)
  2. Catégorie commence par le terme (score 1)
  3. Nom contient le terme (score 2)
  4. Catégorie contient le terme (score 3)
  5. Similarité fuzzy (score 4)
*/

CREATE OR REPLACE FUNCTION public.enterprise_suggest_filtered(
  q text,
  p_limit int DEFAULT 8,
  p_categorie text DEFAULT NULL,
  p_ville text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  nom text,
  ville text,
  categorie text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id::text,
    e.nom,
    e.ville,
    COALESCE(array_to_string(e."catégorie", ', '), '') AS categorie
  FROM public.entreprise e
  WHERE
    e.status = 'approved'
    AND e.nom IS NOT NULL
    AND (
      norm(e.nom) LIKE norm('%' || q || '%')
      OR similarity(norm(e.nom), norm(q)) > 0.3
      OR EXISTS (
        SELECT 1 FROM unnest(e."catégorie") AS cat
        WHERE norm(cat) LIKE norm('%' || q || '%')
           OR similarity(norm(cat), norm(q)) > 0.3
      )
    )
    AND (
      p_ville IS NULL
      OR norm(COALESCE(e.ville, '')) LIKE norm('%' || p_ville || '%')
    )
    AND (
      p_categorie IS NULL
      OR EXISTS (
        SELECT 1 FROM unnest(e."catégorie") AS cat
        WHERE norm(cat) LIKE norm('%' || p_categorie || '%')
      )
    )
  ORDER BY
    CASE
      WHEN norm(e.nom) LIKE norm(q || '%') THEN 0
      WHEN EXISTS (SELECT 1 FROM unnest(e."catégorie") AS cat WHERE norm(cat) LIKE norm(q || '%')) THEN 1
      WHEN norm(e.nom) LIKE norm('%' || q || '%') THEN 2
      WHEN EXISTS (SELECT 1 FROM unnest(e."catégorie") AS cat WHERE norm(cat) LIKE norm('%' || q || '%')) THEN 3
      ELSE 4
    END,
    e.nom ASC
  LIMIT COALESCE(p_limit, 8);
$$;

GRANT EXECUTE ON FUNCTION public.enterprise_suggest_filtered(text, int, text, text) TO anon, authenticated;
