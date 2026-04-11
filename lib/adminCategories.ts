/**
 * Catégories de services administratifs et financiers
 * Utilisées dans la page Administratif pour les entreprises
 *
 * IMPORTANT: Les values correspondent EXACTEMENT aux sous_categories en base de données
 */

export const ADMIN_CATEGORIES = [
  { value: 'Banque', label: 'Banque' },
  { value: 'Trésorerie', label: 'Trésorerie' },
  { value: 'Agence bancaire', label: 'Agence bancaire' },
  { value: 'Microfinance', label: 'Microfinance' },
  { value: 'Bureau de change', label: 'Bureau de change' },
  { value: 'Assurance', label: 'Assurance' },
  { value: 'Administration', label: 'Administration' },
  { value: 'Police', label: 'Police' },
  { value: 'Refuge / Association', label: 'Refuge / Association' },
  { value: 'Agence immobilière', label: 'Agence immobilière' },
  { value: 'Point relais Imprimerie', label: 'Point relais Imprimerie' },
];

/**
 * Helper pour obtenir le label d'une catégorie à partir de sa value
 */
export function getAdminCategoryLabel(value: string): string {
  const category = ADMIN_CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
}
