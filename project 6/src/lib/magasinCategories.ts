/**
 * Catégories de magasins et commerces de proximité
 * Utilisées dans la page Magasins / Marché local
 *
 * IMPORTANT: Les values correspondent EXACTEMENT aux sous_categories en base de données
 */

export const MAGASIN_CATEGORIES = [
  { value: 'Boutique informatique', label: 'Boutique informatique' },
  { value: 'Téléphonie mobile', label: 'Téléphonie mobile' },
  { value: 'Prêt-à-porter', label: 'Prêt-à-porter' },
  { value: 'Vetements homme', label: 'Vetements homme' },
  { value: 'Vetements femme', label: 'Vetements femme' },
  { value: 'Chaussures', label: 'Chaussures' },
  { value: 'Accessoires', label: 'Accessoires' },
  { value: 'Parfumerie', label: 'Parfumerie' },
  { value: 'Bijoux', label: 'Bijoux' },
  { value: 'Electronique', label: 'Electronique' },
  { value: 'Electroménager', label: 'Electroménager' },
  { value: 'Quincaillerie', label: 'Quincaillerie' },
  { value: 'Bricolage', label: 'Bricolage' },
  { value: 'Jouets', label: 'Jouets' },
  { value: 'Meubles', label: 'Meubles' },
  { value: 'articles de déco', label: 'articles de déco' },
  { value: 'Epicerie', label: 'Epicerie' },
  { value: 'Magasin de sport', label: 'Magasin de sport' },
  { value: 'Salon de coiffure', label: 'Salon de coiffure' },
  { value: 'Coiffeur', label: 'Coiffeur' },
  { value: 'Barbier', label: 'Barbier' },
  { value: 'Esthétique', label: 'Esthétique' },
  { value: 'Spa', label: 'Spa' },
  { value: 'Café', label: 'Café' },
  { value: 'Cuisine locale', label: 'Cuisine locale' },
  { value: 'Café culturel', label: 'Café culturel' },
  { value: 'Café traditionnel', label: 'Café traditionnel' },
  { value: 'Salon de thé', label: 'Salon de thé' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'Cuisine tunisienne', label: 'Cuisine tunisienne' },
];

/**
 * Helper pour obtenir le label d'une catégorie à partir de sa value
 */
export function getMagasinCategoryLabel(value: string): string {
  const category = MAGASIN_CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
}
